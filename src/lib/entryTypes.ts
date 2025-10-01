import { EntryType } from "@/generated/prisma";
import { detectSourceType } from "./sourceProcessing";

// Generate entry ID from type and URL
export function autoGenId(type: EntryType, url: string): string {
  const source = detectSourceType(url);
  if(source) {
    // Use getNrsId from sourceProcessing
    // Try to infer entryType from source.entryTypes if available
    const entryType = source.entryTypes && source.entryTypes.length > 0 ? source.entryTypes[0] : type;
    // @ts-ignore: getNrsId is exported from sourceProcessing
    const { getNrsId } = require("./sourceProcessing");
    const id = getNrsId(source.type.type, source.idFragments, entryType);
    if(id) return id;
  }
  const prefix = type ? getPrefixFromType(type as EntryType) : "O";
  const timestamp = new Date().toISOString().replaceAll(/[:\-Z]/g, "").replace(/\..+$/, "");
  return `${prefix}-${timestamp}`;
}

// Helper: get EntryType from ID prefix
export function getTypeFromPrefix(id: string): EntryType | undefined {
  if (id.startsWith("A-")) return EntryType.Anime;
  if (id.startsWith("L-")) return EntryType.Manga;
  if (id.startsWith("V-")) return EntryType.VisualNovel;
  if (id.startsWith("M-")) {
    // Try to infer music type from the rest of the ID
    if (id.includes("AL")) return EntryType.MusicAlbum;
    if (id.includes("AR")) return EntryType.MusicArtist;
    if (id.includes("TR") || id.includes("TRACK")) return EntryType.MusicTrack;
    return EntryType.MusicTrack; // fallback
  }
  if (id.startsWith("F-")) return EntryType.Franchise;
  if (id.startsWith("G-") || id.startsWith("GF-")) return EntryType.Game;
  return undefined;
}

// Helper: get ID prefix from EntryType
export function getPrefixFromType(type: EntryType): string {
  switch (type) {
    case EntryType.Anime: return "A";
    case EntryType.Manga: return "L";
    case EntryType.LightNovel: return "L";
    case EntryType.VisualNovel: return "V";
    case EntryType.MusicAlbum:
    case EntryType.MusicArtist:
    case EntryType.MusicTrack: return "M";
    case EntryType.Franchise: return "F";
    case EntryType.Game: return "G";
    default: return "O";
  }
}

// Helper: get EntryType from string (case-insensitive, fallback to Other)
export function parseEntryType(str: string): EntryType {
  const normalized = str.trim().toLowerCase();
  switch (normalized) {
    case "anime": return EntryType.Anime;
    case "manga": return EntryType.Manga;
    case "lightnovel":
    case "light novel": return EntryType.LightNovel;
    case "visualnovel":
    case "visual novel": return EntryType.VisualNovel;
    case "musicalbum":
    case "music album": return EntryType.MusicAlbum;
    case "musicartist":
    case "music artist": return EntryType.MusicArtist;
    case "musictrack":
    case "music track": return EntryType.MusicTrack;
    case "franchise": return EntryType.Franchise;
    case "game": return EntryType.Game;
    default: return EntryType.Other;
  }
}

export function getEntryTypeName(type: EntryType): string {
  switch (type) {
    case EntryType.Anime: return "Anime";
    case EntryType.Manga: return "Manga";
    case EntryType.LightNovel: return "Light Novel";
    case EntryType.VisualNovel: return "Visual Novel";
    case EntryType.MusicAlbum: return "Music Album";
    case EntryType.MusicArtist: return "Music Artist";
    case EntryType.MusicTrack: return "Music Track";
    case EntryType.Franchise: return "Franchise";
    case EntryType.Game: return "Game";
    default: return "Other";
  }
}