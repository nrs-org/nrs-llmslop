import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
    getOAuthAuthorizationUrl,
    youtubeConfig,
    malConfig,
    anilistConfig,
    spotifyConfig,
    generateState,
    generateCodeVerifier,
    generateCodeChallenge,
} from "@/lib/oauth-link";
import redis from "@/lib/redis";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();
export const constantCodeVerifier = "constantPKCEdummycodeverifiervalue1234567890"; // Must be between 43 and 128 characters

// POST /api/account/oauth-connect
export async function POST(request: Request) {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { provider } = await request.json();
    const state = generateState();
    // Store state in Redis with short expiry
    await redis.set(`oauth_state:${userId}:${provider}`, state, { EX: 600 });

    let config;
    switch (provider) {
        case "youtube":
            config = youtubeConfig;
            break;
        case "myanimelist":
            config = malConfig;
            break;
        case "anilist":
            config = anilistConfig;
            break;
        case "spotify":
            config = spotifyConfig;
            break;
        default:
            return NextResponse.json({ error: "Provider not supported" }, { status: 400 });
    }

    const url = getOAuthAuthorizationUrl(config, state, constantCodeVerifier);
    return NextResponse.json({ url });
}

// DELETE /api/account/oauth-connect
export async function DELETE(request: Request) {
    console.debug("hello");
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { provider } = await request.json();
    // Remove linked account for this user and provider
    await prisma.linkedAccount.delete({
        where: { id: `${userId}:${provider}` },
    }).catch(() => {}); // Ignore if not found
    return NextResponse.json({ success: true });
}