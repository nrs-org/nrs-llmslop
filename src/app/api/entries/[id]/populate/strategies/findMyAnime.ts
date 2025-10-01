// Strategy: find-my-anime
export async function findMyAnimeStrategy(entry: any) {
  // Extract provider and providerId from DAH_additional_sources
  let provider = null;
  let providerId = null;
  let additionalSources = {};
  if (typeof entry.dah_meta === "object" && entry.dah_meta !== null && !Array.isArray(entry.dah_meta)) {
    const metaObj = entry.dah_meta as Record<string, any>;
    if (metaObj.DAH_additional_sources && typeof metaObj.DAH_additional_sources === "object" && metaObj.DAH_additional_sources !== null) {
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
  // Query find-my-anime API
  const apiRes = await fetch(`https://find-my-anime.dtimur.de/api?id=${providerId}&provider=${provider}`, {
    headers: { accept: "*/*" },
  });
  if (!apiRes.ok) throw new Error("Failed to fetch cross-provider IDs");
  const apiData = await apiRes.json();
  if (!Array.isArray(apiData) || !apiData[0]?.providerMapping) {
    throw new Error("No mapping found");
  }
  const mapping = apiData[0].providerMapping;
  // Update entry object directly
  entry.title = apiData[0].title;
  // Ensure DAH_additional_sources exists
  if (!entry.dah_meta) entry.dah_meta = {};
  if (!entry.dah_meta.DAH_additional_sources) entry.dah_meta.DAH_additional_sources = {};
  entry.dah_meta.DAH_additional_sources.id_MyAnimeList = mapping.MyAnimeList;
  entry.dah_meta.DAH_additional_sources.id_AniList = mapping.Anilist;
  entry.dah_meta.DAH_additional_sources.id_Kitsu = mapping.Kitsu;
  entry.dah_meta.DAH_additional_sources.id_AniDB = mapping.AniDB;
  // Add more if needed
  // Merge DAH_animanga_info
  const oldAnimangaInfo = (typeof entry.dah_meta.DAH_animanga_info === "object" && entry.dah_meta.DAH_animanga_info !== null)
    ? entry.dah_meta.DAH_animanga_info
    : {};
  // Only override description if new value is non-empty
  const newDescription = apiData[0].description;
  const mergedDescription = (typeof newDescription === "string" && newDescription.trim()) ? newDescription : oldAnimangaInfo.description;
  // Merge synonyms and tags arrays, removing duplicates
  function mergeArrays(oldArr: any, newArr: any) {
    const arr1 = Array.isArray(oldArr) ? oldArr : [];
    const arr2 = Array.isArray(newArr) ? newArr : [];
    return Array.from(new Set([...arr1, ...arr2]));
  }
  const mergedSynonyms = mergeArrays(oldAnimangaInfo.synonyms, apiData[0].synonyms);
  const mergedTags = mergeArrays(oldAnimangaInfo.tags, apiData[0].tags);
  const newAnimangaInfo = {
    description: mergedDescription,
    type: apiData[0].type,
    status: apiData[0].status,
    picture: apiData[0].picture,
    thumbnail: apiData[0].thumbnail,
    score: apiData[0].score,
    synonyms: mergedSynonyms,
    tags: mergedTags,
  };
  entry.dah_meta.DAH_animanga_info = {
    ...oldAnimangaInfo,
    ...newAnimangaInfo,
  };
  // Merge DAH_anime_info
  const newAnimeInfo = {
    animeSeason: apiData[0].animeSeason,
    episodes: apiData[0].episodes,
    duration: apiData[0].duration,
    studios: apiData[0].studios,
    producers: apiData[0].producers,
  };
  entry.dah_meta.DAH_anime_info = {
    ...(typeof entry.dah_meta.DAH_anime_info === "object" && entry.dah_meta.DAH_anime_info !== null ? entry.dah_meta.DAH_anime_info : {}),
    ...newAnimeInfo,
  };
  return entry;
}
