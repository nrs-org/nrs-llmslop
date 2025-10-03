import {
  AnimangaInfo,
  AnimeInfo,
  MangaInfo,
  updateAnimangaInfo,
  updateAnimeInfo,
  updateMangaInfo,
} from "@/lib/animanga";

function convertMalStatus(malStatus: string) {
  switch (malStatus) {
    case "finished_airing":
    case "finished":
      return "FINISHED";
    case "currently_airing":
    case "currently_publishing":
      return "ONGOING";
    case "not_yet_aired":
    case "not_yet_published":
      return "UPCOMING";
    default:
      return "UNKNOWN";
  }
}

function convertMalType(malType: string) {
  switch (malType) {
    case "tv":
      return "TV";
    case "ova":
      return "OVA";
    case "ona":
      return "ONA";
    case "movie":
      return "MOVIE";
    case "special":
      return "SPECIAL";
    case "music":
      return "MUSIC";
    case "manga":
      return "MANGA";
    case "one_shot":
      return "ONE_SHOT";
    case "doujinshi":
      return "DOUJINSHI";
    case "manhwa":
      return "MANHWA";
    case "manhua":
      return "MANHUA";
    case "oel":
      return "OEL";
    case "novel": // all novels on MAL are light novels
      return "LIGHT_NOVEL";
    default:
      return "UNKNOWN";
  }
}

export async function myAnimeListStrategy(entry: any, token: string) {
  const malId = entry.dah_meta?.DAH_additional_sources?.id_MyAnimeList;
  if (malId) {
    // Use correct typePath for API
    let typePath = "anime";
    if (entry.entryType === "Manga" || entry.entryType === "LightNovel") {
      typePath = "manga";
    }
    const malUrl = `https://api.myanimelist.net/v2/${typePath}/${malId}?fields=title,main_picture,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,start_date,end_date,media_type,status,genres,my_list_status,num_episodes,episodes,source,average_episode_duration,rating,background,related_anime,related_manga,recommendations,studios`;
    console.log(`Fetching MAL data from ${malUrl}`);
    try {
      const res = await fetch(malUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) throw new Error("Unauthorized");
      const malData = await res.json();
      if (malData?.error) throw new Error(`MAL API error: ${malData.error}`);
      if (malData) {
        const animangaInfo: AnimangaInfo = {
          title: malData.title,
          description: malData.synopsis,
          status: convertMalStatus(malData.status),
          type: convertMalType(malData.type),
          picture: malData.main_picture?.large,
          tags: malData.genres?.map((g: any) => g.name),
          synonyms: malData.title_synonyms?.map((s: any) => s),
        };
        updateAnimangaInfo(entry, "MAL", animangaInfo);

        if (typePath === "anime") {
          const animeInfo: AnimeInfo = {
            episodes: malData.episodes,
            duration: {
              value: malData.average_episode_duration,
              unit: "SECONDS"
            },
            animeSeason: malData.start_season,
            studios: malData.studios?.map((s: any) => s.name),
            producers: malData.producers?.map((p: any) => p.name),
          };
          updateAnimeInfo(entry, "MAL", animeInfo);
        } else {
          // manga
          const mangaInfo: MangaInfo = {
            chapters: malData.chapters,
            volumes: malData.volumes,
          };
          updateMangaInfo(entry, "MAL", mangaInfo);
        }
      }
    } catch (ex) {
      console.error("MAL fetch error:", ex);
    }
  }
}
