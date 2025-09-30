import { NextResponse, NextRequest } from "next/server";
import { EntryCreateDTO, EntryProgressCreateDTO } from "@/lib/db_types";
import { EntryStatus } from "@/generated/prisma";
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// Schema for creating an Entry
const createEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  bestGirl: z.string().optional(),
  additionalSources: z.any().optional(),
  dah_meta: z.any().optional(),
  progress: z.object({
    status: z.nativeEnum(EntryStatus),
    length_seconds: z.number().optional(),
    episode: z.number().optional(),
  }).optional(),
});

// GET /api/entries - Get a paginated list of entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const skip = (page - 1) * pageSize;
    const entries = await prisma.entry.findMany({
      skip,
      take: pageSize,
      include: {
        progress: true,
      },
      orderBy: { id: "asc" },
    });
    const totalCount = await prisma.entry.count();
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

    const { progress, ...entryData } = validatedData;

    let newEntry;
    if (progress) {
      newEntry = await prisma.entry.create({
        data: {
          ...entryData,
          progress: {
            create: progress,
          },
        },
        include: { progress: true },
      });
    } else {
      newEntry = await prisma.entry.create({
        data: {
          ...entryData,
          progress: {
            create: { status: EntryStatus.NOT_STARTED },
          },
        },
        include: { progress: true },
      });
    }

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
