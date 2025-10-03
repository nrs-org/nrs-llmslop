import { prisma } from "@/lib/db";
import { Entry, Prisma } from "@/lib/db";
import {
  AnimangaInfo,
  AnimeInfo,
  DahAnimeInfo,
  DahAnimangaInfo,
  DahMangaInfo,
  MangaInfo,
} from "./animanga";

export interface CreateEntryInput {
  id: string;
  title: string;
}

export async function createEntry(input: CreateEntryInput): Promise<Entry> {
  const { id, title } = input;
  return prisma.entry.create({
    data: {
      id,
      title,
    },
  });
}

export async function updateEntryTitle(
  entryId: string,
  title: string,
): Promise<void> {
  await prisma.entry.update({
    where: { id: entryId },
    data: { title },
  });
}

export async function updateAnimangaInfo(
  entryId: string,
  source: keyof DahAnimangaInfo,
  info: Omit<AnimangaInfo, "lastUpdated">,
): Promise<void> {
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    select: { dah_animanga_info: true },
  });
  if (!entry) {
    throw new Error(`Entry with id ${entryId} not found`);
  }

  const currentInfo = (entry.dah_animanga_info as DahAnimangaInfo) || {};
  const updatedSourceInfo = {
    ...(currentInfo[source] || {}),
    ...info,
    lastUpdated: new Date(),
  };

  const newInfo: Prisma.JsonObject = {
    ...currentInfo,
    [source]: updatedSourceInfo,
  };

  await prisma.entry.update({
    where: { id: entryId },
    data: { dah_animanga_info: newInfo },
  });
}

export async function updateAnimeInfo(
  entryId: string,
  source: keyof DahAnimeInfo,
  info: Omit<AnimeInfo, "lastUpdated">,
): Promise<void> {
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    select: { dah_anime_info: true },
  });
  if (!entry) {
    throw new Error(`Entry with id ${entryId} not found`);
  }

  const currentInfo = (entry.dah_anime_info as DahAnimeInfo) || {};
  const updatedSourceInfo = {
    ...(currentInfo[source] || {}),
    ...info,
    lastUpdated: new Date(),
  };

  const newInfo: Prisma.JsonObject = {
    ...currentInfo,
    [source]: updatedSourceInfo,
  };

  await prisma.entry.update({
    where: { id: entryId },
    data: { dah_anime_info: newInfo },
  });
}

export async function updateMangaInfo(
  entryId: string,
  source: keyof DahMangaInfo,
  info: Omit<MangaInfo, "lastUpdated">,
): Promise<void> {
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    select: { dah_manga_info: true },
  });
  if (!entry) {
    throw new Error(`Entry with id ${entryId} not found`);
  }

  const currentInfo = (entry.dah_manga_info as DahMangaInfo) || {};
  const updatedSourceInfo = {
    ...(currentInfo[source] || {}),
    ...info,
    lastUpdated: new Date(),
  };

  const newInfo: Prisma.JsonObject = {
    ...currentInfo,
    [source]: updatedSourceInfo,
  };

  await prisma.entry.update({
    where: { id: entryId },
    data: { dah_manga_info: newInfo },
  });
}
