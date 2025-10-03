import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import redis from "@/lib/redis";
import { youtubeConfig, handleOAuthCallback, malConfig, anilistConfig, spotifyConfig } from "@/lib/oauth-link";
import { constantCodeVerifier } from "@/app/api/account/oauth-connect/route";

const providerConfigs: Record<string, any> = {
  youtube: youtubeConfig,
  myanimelist: malConfig,
  anilist: anilistConfig,
  spotify: spotifyConfig
};

// GET /oauth2/[provider]?code=...&state=...
export async function GET(request: NextRequest, context: { params: { all: string[] } }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const provider = context.params.all?.[0];

  if (!provider || !providerConfigs[provider]) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }
  if (!state && providerConfigs[provider].useStateParam) {
    return NextResponse.json({ error: "Missing state" }, { status: 400 });
  }

  // Get user session
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate state from Redis
  if (providerConfigs[provider].useStateParam) {
    const storedState = await redis.get(`oauth_state:${userId}:${provider}`);
    if (!storedState || storedState !== state) {
      return NextResponse.json({ error: "Invalid or expired state" }, { status: 400 });
    }
    await redis.del(`oauth_state:${userId}:${provider}`);
  }

  // Exchange code for tokens and link account
  try {
    await handleOAuthCallback(providerConfigs[provider], code, userId, {
      codeVerifier: constantCodeVerifier,
    });
    return NextResponse.redirect(`${url.origin}/account`);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
