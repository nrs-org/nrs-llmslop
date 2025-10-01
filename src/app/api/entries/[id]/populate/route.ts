import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { findMyAnimeStrategy } from "./strategies/findMyAnime";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").slice(-2, -1)[0];
    if (!id) {
      return NextResponse.json({ error: "Missing entry ID in URL" }, { status: 400 });
    }
    // Find entry
    const entry = await prisma.entry.findUnique({ where: { id } });
    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    // Strategy: find-my-anime (for anime)
    let updatedEntry = null;
    try {
      updatedEntry = await findMyAnimeStrategy(entry);
    } catch (err: any) {
      return NextResponse.json({ error: `Failed to fetch mapping from find-my-anime API: ${err?.message || String(err)}` }, { status: 502 });
    }
    // Persist updated entry
    const updated = await prisma.entry.update({
      where: { id },
      data: {
        title: updatedEntry.title,
        dah_meta: updatedEntry.dah_meta,
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 400 });
  }
}
