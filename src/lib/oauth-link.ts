// src/lib/oauth-link.ts
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();


export interface OAuthLinkConfig {
  provider: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes?: string[];
  authUrl: string;
  tokenUrl: string;
  accessType?: string;
  prompt?: string;
  pkce?: boolean;
  useStateParam?: boolean;
}


/** Generate authorization URL for any provider */
export function getOAuthAuthorizationUrl(
  config: OAuthLinkConfig,
  state?: string,
  pkceChallenge?: string
) {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
  });
  if(config.scopes) params.set("scope", config.scopes.join(" "));
  if (config.useStateParam !== false && state) params.set("state", state);
  if (config.accessType) params.set("access_type", config.accessType);
  if (config.prompt) params.set("prompt", config.prompt);
  // PKCE support
  if (config.pkce && pkceChallenge) {
    params.set("code_challenge", pkceChallenge);
    // MyAnimeList only supports 'plain' method for PKCE
    params.set("code_challenge_method", config.provider === "myanimelist" ? "plain" : "S256");
  }
  return `${config.authUrl}?${params.toString()}`;
}

/** Exchange code for access & refresh tokens */
export async function handleOAuthCallback(
  config: OAuthLinkConfig,
  code: string,
  userId: string,
  pkce?: { codeVerifier: string }
) {
  const params: Record<string, string> = {
    code,
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    grant_type: "authorization_code",
  };
  if (config.clientSecret) params.client_secret = config.clientSecret;
  if (config.pkce && pkce?.codeVerifier) {
    params.code_verifier = pkce.codeVerifier;
  }
  const tokenRes = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Failed to fetch tokens: ${err}`);
  }

  const tokens = await tokenRes.json();

  await prisma.linkedAccount.upsert({
    where: { id: `${userId}:${config.provider}` },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : undefined,
    },
    create: {
      id: `${userId}:${config.provider}`,
      user: { connect: { id: userId } },
      provider: config.provider,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : undefined,
    },
  });

  return tokens;
}
// PKCE helpers
export function generateCodeVerifier(length = 64): string {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return base64;
}

/** Refresh access token using stored refresh token */
export async function refreshAccessToken(config: OAuthLinkConfig, refreshToken: string) {
  const params: Record<string, string> = {
    client_id: config.clientId,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  };
  if (config.clientSecret) params.client_secret = config.clientSecret;
  const tokenRes = await fetch(config.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Failed to refresh token: ${err}`);
  }

  const tokens = await tokenRes.json();
  return tokens;
}

/** Get valid access token for user; auto-refresh if expired */
export async function getValidAccessToken(config: OAuthLinkConfig, userId: string) {
  const account = await prisma.account.findUnique({
    where: { id: `${userId}:${config.provider}` },
  });
  if (!account) throw new Error("No linked account found");

  const now = new Date();
  if (!account.accessTokenExpiresAt || account.accessTokenExpiresAt > now) {
    return account.accessToken;
  }

  // Token expired → refresh
  if (!account.refreshToken) throw new Error("No refresh token available");

  const newTokens = await refreshAccessToken(config, account.refreshToken);

  await prisma.account.update({
    where: { id: `${userId}:${config.provider}` },
    data: {
      accessToken: newTokens.access_token,
      accessTokenExpiresAt: newTokens.expires_in
        ? new Date(Date.now() + newTokens.expires_in * 1000)
        : undefined,
    },
  });

  return newTokens.access_token;
}

/** Helper to call provider API using stored access token */
export async function callProviderApi(
  config: OAuthLinkConfig,
  userId: string,
  url: string,
  options: RequestInit = {}
) {
  const accessToken = await getValidAccessToken(config, userId);
  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API request failed: ${err}`);
  }

  return res.json();
}

export function generateState(length = 32): string {
  const buf = new Uint8Array(length);
  crypto.getRandomValues(buf);
  return Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
}


export const youtubeConfig: OAuthLinkConfig = {
  provider: "youtube",
  clientId: process.env.YOUTUBE_CLIENT_ID!,
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET!,
  redirectUri: `${process.env.BETTER_AUTH_URL}/oauth2/youtube`,
  scopes: [
    "https://www.googleapis.com/auth/youtube.readonly",
  ],
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  accessType: "offline",
  prompt: "consent",
};

export const malConfig: OAuthLinkConfig = {
  provider: "myanimelist",
  clientId: process.env.MYANIMELIST_CLIENT_ID!,
  clientSecret: process.env.MYANIMELIST_CLIENT_SECRET!,
  redirectUri: `${process.env.BETTER_AUTH_URL}/oauth2/myanimelist`,
  scopes: ["profile", "records", "list"],
  authUrl: "https://myanimelist.net/v1/oauth2/authorize",
  tokenUrl: "https://myanimelist.net/v1/oauth2/token",
  pkce: true,
};

export const anilistConfig: OAuthLinkConfig = {
  provider: "anilist",
  clientId: process.env.ANILIST_CLIENT_ID!,
  clientSecret: process.env.ANILIST_CLIENT_SECRET!,
  redirectUri: `${process.env.BETTER_AUTH_URL}/oauth2/anilist`,
  authUrl: "https://anilist.co/api/v2/oauth/authorize",
  tokenUrl: "https://anilist.co/api/v2/oauth/token",
  useStateParam: false,
};

export const spotifyConfig: OAuthLinkConfig = {
  provider: "spotify",
  clientId: process.env.SPOTIFY_CLIENT_ID!,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
  redirectUri: `${process.env.BETTER_AUTH_URL}/oauth2/spotify`,
  scopes: ["user-read-email", "user-read-private"],
  authUrl: "https://accounts.spotify.com/authorize",
  tokenUrl: "https://accounts.spotify.com/api/token",
};