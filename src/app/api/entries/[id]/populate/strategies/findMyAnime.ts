import {
  AnimangaDataSource,
  updateAdditionalSources,
  updateAnimeInfo,
  updateAnimangaInfo,
  updateEntryTitle,
} from "@/lib/animanga";

// Strategy: find-my-anime
export async function findMyAnimeStrategy(entry: any) {
  // Extract provider and providerId from DAH_additional_sources
  let provider = null;
  let providerId = null;
  let additionalSources = {};
  if (
    typeof entry.dah_meta === "object" &&
    entry.dah_meta !== null &&
    !Array.isArray(entry.dah_meta)
  ) {
    const metaObj = entry.dah_meta as Record<string, any>;
    if (
      metaObj.DAH_additional_sources &&
      typeof metaObj.DAH_additional_sources === "object" &&
      metaObj.DAH_additional_sources !== null
    ) {
      additionalSources = metaObj.DAH_additional_sources;
    }
  }
  const srcObj = additionalSources as Record<string, any>;

  if (srcObj.id_MyAnimeList) {
    provider = "MyAnimeList";
    providerId = srcObj.id_MyAnimeList;
  } else if (srcObj.id_AniList) {
    provider = "Anilist";
    providerId = srcObj.id_AniList;
  } else if (srcObj.id_Kitsu) {
    provider = "Kitsu";
    providerId = srcObj.id_Kitsu;
  }
  if (!provider || !providerId) {
    throw new Error("No supported provider ID found in entry");
  }

  const source: AnimangaDataSource = "AOD";

  try {
    // Query find-my-anime API
    const apiRes = await fetch(
      `https://find-my-anime.dtimur.de/api?id=${providerId}&provider=${provider}`,
      {
        headers: { accept: "*/*" },
      },
    );
    if (!apiRes.ok) throw new Error("Failed to fetch cross-provider IDs");
    const apiData = await apiRes.json();
    if (!Array.isArray(apiData) || !apiData[0]?.providerMapping) {
      throw new Error("No mapping found");
    }
    const animeData = apiData[0];
    const mapping = animeData.providerMapping;

    updateEntryTitle(entry, animeData.title);

    updateAnimangaInfo(entry, source, {
      description: animeData.description,
      type: animeData.type,
      status: animeData.status,
      picture: animeData.picture,
      thumbnail: animeData.thumbnail,
      synonyms: animeData.synonyms,
      tags: animeData.tags,
    });

    updateAnimeInfo(entry, source, {
      animeSeason: animeData.animeSeason,
      episodes: animeData.episodes,
      duration: animeData.duration,
      studios: animeData.studios,
      producers: animeData.producers,
    });

    updateAdditionalSources(entry, mapping);
  } catch (ex) {
    console.error("FindMyAnime fetch error:", ex);
  }
}
