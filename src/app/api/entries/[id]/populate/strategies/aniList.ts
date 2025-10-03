import {
  AnimangaInfo,
  AnimeInfo,
  MangaInfo,
  updateAnimangaInfo,
  updateAnimeInfo,
  updateMangaInfo,
} from "@/lib/animanga";

function convertAniListStatus(status: string) {
  switch (status) {
    case "FINISHED":
      return "FINISHED";
    case "RELEASING":
      return "ONGOING";
    case "NOT_YET_RELEASED":
      return "UPCOMING";
    default:
      return "UNKNOWN";
  }
}

function convertAniListType(type: string) {
  switch (type) {
    case "TV":
      return "TV";
    case "OVA":
      return "OVA";
    case "ONA":
      return "ONA";
    case "MOVIE":
      return "MOVIE";
    case "SPECIAL":
      return "SPECIAL";
    case "MANGA":
      return "MANGA";
    case "NOVEL":
      return "LIGHT_NOVEL";
    case "ONE_SHOT":
      return "ONE_SHOT";
    default:
      return "UNKNOWN";
  }
}

export async function aniListStrategy(entry: any, token: string) {
  const alId = entry.dah_meta?.DAH_additional_sources?.id_AniList;
  if (alId) {
    // Use correct typePath for API
    let typePath = "ANIME";
    if (entry.entryType === "Manga" || entry.entryType === "LightNovel") {
      typePath = "MANGA";
    }
    // AniList GraphQL API
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ${typePath}) {
          id
          title { romaji english native }
          description
          status
          type
          coverImage { large }
          genres
          synonyms
          episodes
          duration
          chapters
          volumes
          startDate { year month day }
          studios { nodes { name } }
          season
          seasonYear
        }
      }
    `;
    try {
      const res = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, variables: { id: Number(alId) } }),
      });
      if (res.status === 401) throw new Error("Unauthorized");
      const json = await res.json();
      if (json.errors) throw new Error(`AniList API error: ${json.errors[0].message}`);
      const media = json.data?.Media;
      if (media) {
        const mainTitle = media.title?.english || media.title?.romaji || media.title?.native;
        const allSynonyms = [
          media.title?.english,
          media.title?.romaji,
          media.title?.native,
          ...(Array.isArray(media.synonyms) ? media.synonyms : [])
        ].filter(s => !!s && s !== mainTitle);
        const animangaInfo: AnimangaInfo = {
          title: mainTitle,
          description: media.description,
          status: convertAniListStatus(media.status),
          type: convertAniListType(media.type),
          picture: media.coverImage?.large,
          tags: media.genres,
          synonyms: allSynonyms,
        };
        updateAnimangaInfo(entry, "AL", animangaInfo);

        if (typePath === "ANIME") {
          const animeInfo: AnimeInfo = {
            episodes: media.episodes,
            duration: {
              value: typeof media.duration === "number" ? media.duration * 60 : 0,
              unit: "SECONDS"
            },
            animeSeason: {season: media.season, year: media.seasonYear || 0},
            studios: media.studios?.nodes?.filter((s: any) => s.isAnimationStudio)?.map((s: any) => s.name),
            producers: media.producers?.nodes?.filter((p: any) => !p.isAnimationStudio)?.map((p: any) => p.name) || [],
          };
          updateAnimeInfo(entry, "AL", animeInfo);
        } else {
          // manga
          const mangaInfo: MangaInfo = {
            chapters: media.chapters,
            volumes: media.volumes,
          };
          updateMangaInfo(entry, "AL", mangaInfo);
        }
      }
    } catch (ex) {
      console.error("AniList fetch error:", ex);
    }
  }
}
