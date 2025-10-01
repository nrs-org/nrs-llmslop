// Standalone ID logic for all sources
export function getNrsId(sourceType: SupportedSourceTypeName, m: string[], entryType?: EntryType): string | undefined {
  if (sourceType === "MAL" || sourceType === "AL" || sourceType === "KS") {
    if (entryType === EntryType.Anime) return `A-${sourceType}-${m[1]}`;
    if (entryType === EntryType.Manga || entryType === EntryType.LightNovel) return `L-${sourceType}-${m[1]}`;
    return undefined;
  }
  if (sourceType === "ADB") {
    return `A-ADB-${m[1]}`;
  }
  if (sourceType === "VNDB") {
    return `V-VNDB-${m[0]}`;
  }
  if (sourceType === "VGMDB") {
    if (m[1] === "artist" && m[2]) return `M-VGMDB-AR-${m[2]}`;
    if (m[1] === "album" && m[2] && !m[3]) return `M-VGMDB-AL-${m[2]}`;
    if (m[1] === "album" && m[2] && m[3]) return `M-VGMDB-AL-${m[2]}-${m[3]}`;
    return undefined;
  }
  // YT and SPOT have no nrsId
  return undefined;
}
import { EntryType } from "@/generated/prisma";

export type SupportedSourceTypeName =
  | "MAL"
  | "AL"
  | "KS"
  | "ADB"
  | "VNDB"
  | "VGMDB"
  | "YT"
  | "SPOT";

export interface SourceDetection {
  type: SupportedSourceType;
  idFragments: string[];
  entryTypes: EntryType[];
  upstreamType?: string;
}

export interface SupportedSourceType {
  type: SupportedSourceTypeName;
  name: string;
  icon: string;
  match: RegExp;
  // Removed nrsId callback
}

const sourceSpecs: Record<SupportedSourceTypeName, SupportedSourceType> = {
  "MAL": {
    type: "MAL",
    name: "MyAnimeList",
    icon: "/source-icons/MyAnimeList.svg",
    match: /myanimelist\.net\/(anime|manga)\/(\d+)/,
  },
  "AL": {
    type: "AL",
    name: "AniList",
    icon: "/source-icons/AniList.svg",
    match: /anilist\.co\/(anime|manga)\/(\d+)/,
  // ...existing code...
  },
  "KS": {
    type: "KS",
    name: "Kitsu",
    icon: "/source-icons/Kitsu.png",
    match: /kitsu\.(?:io|app)\/(anime|manga)\/(\d+)/,
  // ...existing code...
  },
  "ADB": {
    type: "ADB",
    name: "AniDB",
    icon: "/source-icons/AniDB@32.png",
    match: /anidb\.net\/(anime|manga)\/(\d+)/,
  // ...existing code...
  },
  "VNDB": {
    type: "VNDB",
    name: "VNDB",
    icon: "/source-icons/VNDB.svg",
    match: /vndb\.org\/v(\d+)/,
  // ...existing code...
  },
  "VGMDB": {
    type: "VGMDB",
    name: "VGMDB",
    icon: "/source-icons/VGMDB.png",
    match: /vgmdb\.net\/(artist|album)(?:\/(\d+))?(?:\/(\d+))?/, // matches artist, album, track
    // ...existing code...
  },
  "YT": {
    type: "YT",
    name: "YouTube",
    icon: "/source-icons/YouTube.svg",
    match: /(?:youtube\.com\/(?:watch\?v=([\w-]{11})|playlist\?list=([\w-]+)|(?:user|channel|@)([\w-]+))|youtu\.be\/([\w-]{11}))/,
  // ...existing code...
  },
  "SPOT": {
    type: "SPOT",
    name: "Spotify",
    icon: "/source-icons/Spotify.svg",
    match: /open\.spotify\.com\//,
  // ...existing code...
  },
};

export function detectSourceType(url: string): SourceDetection | undefined {
  for (const spec of Object.values(sourceSpecs)) {
    const m = url.match(spec.match);
    if (m) {
      let entryTypes: EntryType[] = [];
      let upstreamType: string | undefined = undefined;
      if (spec.type === "MAL" || spec.type === "AL" || spec.type === "KS") {
        if (m[1] === "anime") {
          entryTypes = [EntryType.Anime];
          upstreamType = "Anime";
        } else if (m[1] === "manga") {
          entryTypes = [EntryType.Manga, EntryType.LightNovel];
          upstreamType = "Manga";
        }
      } else if (spec.type === "YT") {
        if (m[1]) upstreamType = "YouTube Video";
        else if (m[2]) upstreamType = "YouTube Playlist";
        else if (m[3]) upstreamType = "YouTube User";
        else if (m[4]) upstreamType = "YouTube Video";
      } else if (spec.type === "VGMDB") {
        if (m[1] === "artist") upstreamType = "VGMDB Artist";
        else if (m[1] === "album" && m[3]) upstreamType = "VGMDB Track";
        else if (m[1] === "album") upstreamType = "VGMDB Album";
      } else if (spec.type === "ADB") {
        if (m[1] === "anime") upstreamType = "AniDB Anime";
        else if (m[1] === "manga") upstreamType = "AniDB Manga";
      } else if (spec.type === "VNDB") {
        upstreamType = "VNDB Visual Novel";
      } else if (spec.type === "SPOT") {
        upstreamType = "Spotify";
      }
      return {
        type: spec,
        idFragments: m.slice(1).filter(Boolean),
        entryTypes,
        upstreamType,
      };
    }
  }
  return undefined;
}

export function parseSourceType(type: string): SupportedSourceType | undefined {
  for(const [key, value] of Object.entries(sourceSpecs)) {
    if(key.split("-")[0] === type) return value;
  }
  return undefined;
}

export function getSupportedSourceType(type: SupportedSourceTypeName): SupportedSourceType {
  for(const [key, value] of Object.entries(sourceSpecs)) {
    if(key === type) return value;
  }
  throw new Error(`Unsupported source type: ${type}`);
}
