import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { findMyAnimeStrategy } from "./strategies/findMyAnime";
import { myAnimeListStrategy } from "./strategies/myAnimeList";
import { getValidAccessToken, malConfig } from "@/lib/oauth-link";
import { auth } from "@/lib/auth";
import { resolveAnimangaInfo } from "@/lib/animanga";

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
    // Get userId from request/session (assume header 'x-user-id' for simplicity)
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
    // Strategy: find-my-anime (for anime)
    const updateData = {};
    try {
      if (entry.entryType === "Anime") {
        await findMyAnimeStrategy(entry);
      }
    } catch (err: any) {
      return NextResponse.json({ error: `Failed to fetch mapping from find-my-anime API: ${err?.message || String(err)}` }, { status: 502 });
    }
    // Strategy: MyAnimeList API (for non-anime entries)
    try {
      if(userId) {
        const token = await getValidAccessToken(malConfig, userId!);
        if(token) {
          console.debug("token", token);
          await myAnimeListStrategy(entry, token);
        }
      }
    } catch (err: any) {
      return NextResponse.json({ error: `Failed to fetch from MyAnimeList API: ${err?.message || String(err)}` }, { status: 502 });
    }
    
    let title = undefined;
    if((entry.dah_meta as any)?.DAH_animanga_info) {
      const animanga = resolveAnimangaInfo((entry.dah_meta as any)?.DAH_animanga_info);
      title = animanga.title;
    }
    // Persist updated entry
    const updated = await prisma.entry.update({
      where: { id },
      data: {
        title,
        dah_meta: entry.dah_meta === null ? undefined : entry.dah_meta
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 400 });
  }
}
