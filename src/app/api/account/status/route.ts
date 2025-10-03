
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

// GET /api/account/status
export async function GET(request: NextRequest) {
  // Use Better Auth to get the session
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const providers = ["myanimelist", "anilist", "youtube", "spotify"];
  // Use the account table for linked status
  const linked = await prisma.linkedAccount.findMany({
    where: {
      userId,
      provider: { in: providers },
    },
    select: { provider: true },
  });
  const status: Record<string, boolean> = {};
  for (const provider of providers) {
    status[provider] = linked.some(acc => acc.provider === provider);
  }
  return NextResponse.json({ status });
}
