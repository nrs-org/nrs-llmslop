import {
  updateAnimangaInfo,
  updateAnimeInfo,
  updateEntryTitle,
  updateMangaInfo,
} from "@/lib/animanga";

export async function myAnimeListStrategy(entry: any) {
  const malId = entry.dah_meta?.DAH_additional_sources?.id_MyAnimeList;
  if (malId) {
    // Use correct typePath for API
    let typePath = "anime";
    if (entry.entryType === "Manga" || entry.entryType === "LightNovel") {
      typePath = "manga";
    }
    const malUrl = `https://api.jikan.moe/v4/${typePath}/${malId}`;
    console.log(`Fetching MAL data from ${malUrl}`);
    try {
      const malRes = await fetch(malUrl);
      if (!malRes.ok) throw new Error(`MAL API error: ${malRes.status}`);
      const malData = await malRes.json();
      if (malData?.data) {
        if (malData.data.title) {
          updateEntryTitle(entry, malData.data.title);
        }

        const animangaInfo = {
          title: malData.data.title,
          description: malData.data.synopsis,
          status: malData.data.status,
          type: malData.data.type,
          picture: malData.data.images?.jpg?.image_url,
          tags: malData.data.genres?.map((g: any) => g.name),
          synonyms: malData.data.title_synonyms?.map((s: any) => s),
        };
        updateAnimangaInfo(entry, "MAL", animangaInfo);

        if (typePath === "anime") {
          const animeInfo = {
            episodes: malData.data.episodes,
            duration: malData.data.duration,
            animeSeason: malData.data.season
              ? { season: malData.data.season, year: malData.data.year }
              : undefined,
            studios: malData.data.studios?.map((s: any) => s.name),
            producers: malData.data.producers?.map((p: any) => p.name),
          };
          updateAnimeInfo(entry, "MAL", animeInfo);
        } else {
          // manga
          const mangaInfo = {
            chapters: malData.data.chapters,
            volumes: malData.data.volumes,
          };
          updateMangaInfo(entry, "MAL", mangaInfo);
        }
      }
    } catch (ex) {
      console.error("MAL fetch error:", ex);
    }
  }
}
