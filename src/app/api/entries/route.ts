import { NextResponse, NextRequest } from "next/server";
import { EntryCreateDTO, EntryProgressCreateDTO } from "@/lib/db_types";
import { EntryStatus, EntryType } from "@/generated/prisma";
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";
import { getTypeFromPrefix } from "@/lib/entryTypes";
import { isValidEntryId, parseEntryId } from "@/lib/entryId";



const prisma = new PrismaClient();

// Schema for creating an Entry
const createEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  entryType: z.enum(EntryType),
  url: z.string().optional(),
  urlSourceName: z.string().optional(),
});

// GET /api/entries - Get a paginated list of entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search")?.trim() || "";

    const skip = (page - 1) * pageSize;
    const where = search
      ? { title: { contains: search, mode: "insensitive" as const } }
      : undefined;
    const entries = await prisma.entry.findMany({
      skip,
      take: pageSize,
      where,
      include: {
        progress: true,
      },
      orderBy: { id: "asc" },
    });
    const totalCount = await prisma.entry.count({ where });
    const hasNextPage = skip + pageSize < totalCount;
    const hasPreviousPage = page > 1;
    return NextResponse.json({ entries, hasNextPage, hasPreviousPage });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/entries - Create a new entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createEntrySchema.parse(body);
    console.debug(body);
    const parsedId = parseEntryId(validatedData.id);
    // Entry type vs ID prefix
    if (validatedData.id && validatedData.entryType) {
      const prefixType = getTypeFromPrefix(validatedData.id);
      if (prefixType && prefixType !== validatedData.entryType) {
        return NextResponse.json({ error: `ID prefix (${validatedData.id.split("-")[0]}) does not match entry type (${validatedData.entryType})` }, { status: 400 });
      }
    }

    // Malformed URL or missing urlSourceName
    if (validatedData.url !== undefined && validatedData.url !== "") {
      let urlValid = true;
      try {
        new URL(validatedData.url);
      } catch {
        urlValid = false;
      }
      if (!urlValid) {
        return NextResponse.json({ error: "Malformed URL. Please enter a valid URL or leave empty for no source." }, { status: 400 });
      }
      // If not malformed, but no urlSourceName for unknown source
      if (validatedData.urlSourceName === undefined || validatedData.urlSourceName === "") {
        // You may want to add more logic to detect known sources, but for now, require urlSourceName if not present
        return NextResponse.json({ error: "URL name is required for unknown source." }, { status: 400 });
      }
    }

    const entryData: any = {
      id: validatedData.id,
      title: validatedData.title,
      entryType: validatedData.entryType,
    };
    entryData.dah_meta = {
      DAH_additional_sources: {}
    };

    if (parsedId && parsedId.kind === "standard") {
      const db = parsedId.sourceType;
      const entryId = Number(parsedId.entryIdInDatabase);
      switch (db.type) {
        case "MAL":
          entryData.dah_meta.DAH_additional_sources.id_MyAnimeList = entryId;
          break;
        case "AL":
          entryData.dah_meta.DAH_additional_sources.id_AniList = entryId;
          break;
        case "KS":
          entryData.dah_meta.DAH_additional_sources.id_Kitsu = entryId;
          break;
        case "ADB":
          entryData.dah_meta.DAH_additional_sources.id_AniDB = entryId;
          break;
        case "VNDB":
          entryData.dah_meta.DAH_additional_sources.id_VNDB = entryId;
          break;
        case "VGMDB-Album":
          entryData.dah_meta.DAH_additional_sources.vgmdb = { album: entryId };
          break;
        case "VGMDB-Artist":
          entryData.dah_meta.DAH_additional_sources.vgmdb = { artist: entryId };
          break;
        case "VGMDB-Track":
          entryData.dah_meta.DAH_additional_sources.vgmdb = { album: entryId, track: parseInt(parsedId.suffix!) };
          break;
        default: // If url/urlSourceName are present, add to DAH_additional_sources under dah_meta
          if (validatedData.url && validatedData.urlSourceName) {
            entryData.dah_meta.DAH_additional_sources.urls = [
              {
                src: validatedData.url,
                name: validatedData.urlSourceName,
              },
            ];
          }
          break;
      }
    }
    try {
      const newEntry = await prisma.entry.create({
        data: entryData,
      });
      return NextResponse.json(newEntry, { status: 201 });
    } catch (error: any) {
      console.debug(error);
      // Prisma unique constraint error code: P2002
      if (error.code === "P2002" && error.meta?.target?.includes("id")) {
        const entryId = entryData.id;
        return NextResponse.json({
          error: `An entry with this ID already exists.`,
          link: `/entries/${entryId}`,
        }, { status: 409 });
      }
      throw error;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
