import { EntryType } from "@/generated/prisma";

export type SupportedSourceTypeName =
  | "MAL"
  | "AL"
  | "KS"
  | "ADB"
  | "VNDB"
  | "VGMDB-Album"
  | "VGMDB-Artist"
  | "VGMDB-Track"
  | "YT-Video"
  | "YT-Playlist"
  | "YT-User"
  | "SPOT";

export interface SourceDetection {
  type: SupportedSourceType;
  idFragments: string[];
}

export interface SupportedSourceType {
  type: SupportedSourceTypeName;
  entryType?: EntryType;
  name: string;
  subname?: string;
  icon: string;
  match: RegExp;
  nrsId: (m: string[]) => string | undefined;
}

const sourceSpecs: Record<SupportedSourceTypeName, SupportedSourceType> = {
  "MAL": {
    type: "MAL",
    entryType: EntryType.Anime,
    name: "MyAnimeList",
    icon: "/source-icons/MyAnimeList.svg",
    match: /myanimelist\.net\/anime\/(\d+)/,
    nrsId: m => `A-MAL-${m[0]}`,
  },
  "AL": {
    type: "AL",
    entryType: EntryType.Anime,
    name: "AniList",
    icon: "/source-icons/AniList.svg",
    match: /anilist\.co\/anime\/(\d+)/,
    nrsId: m => `A-AL-${m[0]}`,
  },
  "KS": {
    type: "KS",
    entryType: EntryType.Anime,
    name: "Kitsu",
    icon: "/source-icons/Kitsu.png",
  match: /kitsu\.(?:io|app)\/anime\/(\d+)/,
    nrsId: m => `A-KS-${m[0]}`,
  },
  "ADB": {
    type: "ADB",
    entryType: EntryType.Anime,
    name: "AniDB",
    icon: "/source-icons/AniDB@32.png",
    match: /anidb\.net\/anime\/(\d+)/,
    nrsId: m => `A-ADB-${m[0]}`,
  },
  "VNDB": {
    type: "VNDB",
    entryType: EntryType.VisualNovel,
    name: "VNDB",
    icon: "/source-icons/VNDB.svg",
    match: /vndb\.org\/v(\d+)/,
    nrsId: m => `V-VNDB-${m[0]}`,
  },
  "VGMDB-Artist": {
    type: "VGMDB-Artist",
    entryType: EntryType.MusicArtist,
    name: "VGMDB",
    subname: "Artist",
    icon: "/source-icons/VGMDB.png",
    match: /vgmdb\.net\/artist\/(\d+)/,
    nrsId: m => `M-VGMDB-AR-${m[0]}`,
  },
  "VGMDB-Album": {
    type: "VGMDB-Album",
    entryType: EntryType.MusicAlbum,
    name: "VGMDB",
    subname: "Album",
    icon: "/source-icons/VGMDB.png",
    match: /vgmdb\.net\/album\/(\d+)/,
    nrsId: m => `M-VGMDB-AL-${m[0]}`,
  },
  "VGMDB-Track": {
    type: "VGMDB-Track",
    entryType: EntryType.MusicTrack,
    name: "VGMDB",
    subname: "Track",
    icon: "/source-icons/VGMDB.png",
    match: /vgmdb\.net\/album\/(\d+)\/(\d+)/,
    nrsId: m => `M-VGMDB-AL-${m[0]}-${m[1]}`,
  },
  "YT-Video": {
    type: "YT-Video",
    name: "YouTube",
    subname: "Video",
    icon: "/source-icons/YouTube.svg",
    match: /youtube\.com\/watch\?v=([\w-]+)|youtu\.be\/([\w-]+)/,
    nrsId: () => undefined,
  },
  "YT-Playlist": {
    type: "YT-Playlist",
    name: "YouTube",
    subname: "Playlist",
    icon: "/source-icons/YouTube.svg",
    match: /youtube\.com\/playlist\?list=([\w-]+)/,
    nrsId: () => undefined,
  },
  "YT-User": {
    type: "YT-User",
    name: "YouTube",
    subname: "User",
    icon: "/source-icons/YouTube.svg",
    match: /youtube\.com\/(user|channel|@)[^/]+/,
    nrsId: () => undefined,
  },
  "SPOT": {
    type: "SPOT",
    name: "Spotify",
    icon: "/source-icons/Spotify.svg",
    match: /open\.spotify\.com\//,
    nrsId: () => undefined,
  },
};

export function detectSourceType(url: string): SourceDetection | undefined {
  for (const spec of Object.values(sourceSpecs)) {
    const m = url.match(spec.match);
    if (m) {
      return {
        type: spec,
        idFragments: m.slice(1).filter(Boolean),
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
