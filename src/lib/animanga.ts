import { Entry } from "@/generated/prisma";

// Source identifiers from DAH_entry_id_impl.md
export type AnimangaDataSource = "MAL" | "AL" | "ADB" | "KS" | "USER" | "AOD";

export interface AnimangaInfo {
  lastUpdated?: string;
  title?: string
  type?: "TV" | "OVA" | "ONA" | "MOVIE" | "SPECIAL" | "MUSIC" | "MANGA" | "ONE_SHOT" | "DOUJINSHI" | "MANHWA" | "MANHUA" | "OEL" | "LIGHT_NOVEL" | "UNKNOWN";
  status?: "FINISHED" | "ONGOING" | "UPCOMING" | "UNKNOWN";
  picture?: string;
  thumbnail?: string;
  synonyms?: string[];
  tags?: string[];
  description?: string;
}

export interface AnimeInfo {
  lastUpdated?: string;
  episodes?: number;
  animeSeason?: { season: string; year: number };
  duration?: { value: number, unit: "SECONDS" };
  studios?: string[];
  producers?: string[];
}

export interface MangaInfo {
  lastUpdated?: string;
  chapters?: number;
  volumes?: number;
}

export type DahAnimangaInfo = {
  [source in AnimangaDataSource]?: Partial<AnimangaInfo>;
};

export type DahAnimeInfo = {
  [source in AnimangaDataSource]?: Partial<AnimeInfo>;
};

export type DahMangaInfo = {
  [source in AnimangaDataSource]?: Partial<MangaInfo>;
};

const basePriorities: { [source in AnimangaDataSource]: number } = {
  USER: Infinity, // User overrides always have the highest priority
  AL: 10,
  MAL: 9,
  ADB: 8,
  AOD: 8,
  KS: 7,
};

// Tau in milliseconds (30 days)
const TAU = 30 * 24 * 60 * 60 * 1000;

type ResolutionStrategy = "override" | "merge";

const animangaInfoStrategy: {
  [key in keyof Omit<AnimangaInfo, "lastUpdated">]: ResolutionStrategy;
} = {
  title: "override",
  type: "override",
  status: "override",
  picture: "override",
  thumbnail: "override",
  synonyms: "merge",
  tags: "merge",
  description: "override",
};

const animeInfoStrategy: {
  [key in keyof Omit<AnimeInfo, "lastUpdated">]: ResolutionStrategy;
} = {
  episodes: "override",
  animeSeason: "override",
  duration: "override",
  studios: "merge",
  producers: "merge",
};

const mangaInfoStrategy: {
  [key in keyof Omit<MangaInfo, "lastUpdated">]: ResolutionStrategy;
} = {
  chapters: "override",
  volumes: "override",
};

function resolve<T extends { lastUpdated?: string }>(
  data: { [source in AnimangaDataSource]?: Partial<T> },
  strategy: { [key in keyof Omit<T, "lastUpdated">]: ResolutionStrategy },
): Partial<Omit<T, "lastUpdated">> {
  const resolved: Partial<Omit<T, "lastUpdated">> = {};

  const now = new Date().getTime();
  const sourcePriorities = (Object.keys(data) as AnimangaDataSource[])
    .map((source) => {
      const info = data[source];
      const base = basePriorities[source];
      if (base === Infinity) {
        return { source, priority: Infinity };
      }
      if (!info || !info.lastUpdated) {
        return { source, priority: -1 }; // Ignore sources without lastUpdated
      }

      const lastUpdatedDate = new Date(info.lastUpdated);
      if (isNaN(lastUpdatedDate.getTime())) {
        return { source, priority: -1 }; // Invalid date string
      }

      const elapsed = now - lastUpdatedDate.getTime();
      const priority = base * Math.exp(-elapsed / TAU);
      return { source, priority };
    })
    .filter((item) => item.priority !== -1);

  sourcePriorities.sort((a, b) => b.priority - a.priority);
  const dynamicSourcePriority = sourcePriorities.map((p) => p.source);

  const keys = new Set<keyof Omit<T, "lastUpdated">>();
  for (const source of dynamicSourcePriority) {
    const info = data[source];
    if (info) {
      for (const key in info) {
        if (key !== "lastUpdated" && Object.prototype.hasOwnProperty.call(info, key)) {
          keys.add(key as unknown as keyof Omit<T, "lastUpdated">);
        }
      }
    }
  }

  for (const key of keys) {
    const keyStrategy = strategy[key];

    if (keyStrategy === "override") {
      let bestValue: any = undefined;
      for (const source of dynamicSourcePriority) {
        const info = data[source];
        const value = info ? info[key as keyof T] : undefined;
        console.debug(key, source, value);
        if (
          value !== undefined &&
          value !== null &&
          !(typeof value === "string" && value === "UNKNOWN")
        ) {
          bestValue = value;
          break;
        }
        // If no better value found, keep looking for a non-null/undefined/UNKNOWN value
      }
      // If no bestValue found, fallback to first null/undefined/UNKNOWN value (if any)
      if (bestValue === undefined) {
        for (const source of dynamicSourcePriority) {
          const info = data[source];
          const value = info ? info[key as keyof T] : undefined;
          if (value !== undefined) {
            bestValue = value;
            break;
          }
        }
      }
      if (bestValue !== undefined) {
        resolved[key] = bestValue as Omit<T, "lastUpdated">[keyof Omit<T, "lastUpdated">];
      }
    } else if (keyStrategy === "merge") {
      const merged = new Set<any>();
      for (const source of dynamicSourcePriority) {
        const info = data[source];
        if (info && Array.isArray(info[key as keyof T])) {
          for (const item of info[key as keyof T] as any[]) {
            merged.add(item);
          }
        }
      }
      resolved[key] = Array.from(merged) as unknown as Omit<T, "lastUpdated">[keyof Omit<T, "lastUpdated">];
    }
  }

  return resolved;
}

export function resolveAnimangaInfo(
  data: DahAnimangaInfo,
): Omit<AnimangaInfo, "lastUpdated"> {
  return resolve(data, animangaInfoStrategy);
}

export function resolveAnimeInfo(
  data: DahAnimeInfo,
): Omit<AnimeInfo, "lastUpdated"> {
  return resolve(data, animeInfoStrategy);
}

export function resolveMangaInfo(
  data: DahMangaInfo,
): Omit<MangaInfo, "lastUpdated"> {
  return resolve(data, mangaInfoStrategy);
}

export function updateEntryTitle(entry: Entry, title: string): void {
  entry.title = title;
}

export function updateAnimangaInfo(
  entry: Entry,
  source: AnimangaDataSource,
  info: Omit<AnimangaInfo, "lastUpdated">,
): void {
  const sanitizedInfo = { ...info };

  if (sanitizedInfo.tags && Array.isArray(sanitizedInfo.tags)) {
    sanitizedInfo.tags = sanitizedInfo.tags.map((tag) => tag.toLowerCase());
  }
  if (sanitizedInfo.synonyms && Array.isArray(sanitizedInfo.synonyms)) {
    sanitizedInfo.synonyms = sanitizedInfo.synonyms.map((s) => s.toLowerCase());
  }

  if (!entry.dah_meta) {
    entry.dah_meta = {};
  }
  const dah_meta = entry.dah_meta as { [key: string]: any };
  const currentDahInfo = (dah_meta.DAH_animanga_info as DahAnimangaInfo) || {};

  const updatedSourceInfo = {
    ...sanitizedInfo,
    lastUpdated: new Date().toISOString(),
  };

  dah_meta.DAH_animanga_info = {
    ...currentDahInfo,
    [source]: updatedSourceInfo,
  };
}

export function updateAnimeInfo(
  entry: Entry,
  source: AnimangaDataSource,
  info: Omit<AnimeInfo, "lastUpdated">,
): void {
  const sanitizedInfo = { ...info };

  if (sanitizedInfo.studios && Array.isArray(sanitizedInfo.studios)) {
    sanitizedInfo.studios = sanitizedInfo.studios.map((s) => s.toLowerCase());
  }
  if (sanitizedInfo.producers && Array.isArray(sanitizedInfo.producers)) {
    sanitizedInfo.producers = sanitizedInfo.producers.map((p) =>
      p.toLowerCase(),
    );
  }

  if (!entry.dah_meta) {
    entry.dah_meta = {};
  }
  const dah_meta = entry.dah_meta as { [key: string]: any };
  const currentDahInfo = (dah_meta.DAH_anime_info as DahAnimeInfo) || {};

  const updatedSourceInfo = {
    ...sanitizedInfo,
    lastUpdated: new Date().toISOString(),
  };

  dah_meta.DAH_anime_info = {
    ...currentDahInfo,
    [source]: updatedSourceInfo,
  };
}

export function updateMangaInfo(
  entry: Entry,
  source: AnimangaDataSource,
  info: Omit<MangaInfo, "lastUpdated">,
): void {
  if (!entry.dah_meta) {
    entry.dah_meta = {};
  }
  const dah_meta = entry.dah_meta as { [key: string]: any };
  const currentDahInfo = (dah_meta.DAH_manga_info as DahMangaInfo) || {};

  const updatedSourceInfo = {
    ...info,
    lastUpdated: new Date().toISOString(),
  };

  dah_meta.DAH_manga_info = {
    ...currentDahInfo,
    [source]: updatedSourceInfo,
  };
}

export function updateAdditionalSources(entry: Entry, mapping: any): void {
  if (!entry.dah_meta) {
    entry.dah_meta = {};
  }
  const dah_meta = entry.dah_meta as { [key: string]: any };

  dah_meta.DAH_additional_sources = {
    ...((dah_meta as any)?.DAH_additional_sources || {}),
    id_MyAnimeList: mapping.MyAnimeList,
    id_AniList: mapping.Anilist,
    id_Kitsu: mapping.Kitsu,
    id_AniDB: mapping.AniDB,
  };
}
