import { NextResponse, NextRequest } from "next/server";
import { DbApi } from "@/lib/db_api";
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();
const dbApi = new DbApi(prisma);

// Schema for updating NRSContext
const updateNRSContextSchema = z.object({
  factorScoreWeights: z.any().optional(),
});

// GET /api/nrs-context - Get the NRSContext instance
export async function GET() {
  try {
    const nrsContext = await dbApi.getNRSContext();

    if (!nrsContext) {
      return NextResponse.json({ error: "NRSContext not found" }, { status: 404 });
    }

    return NextResponse.json(nrsContext);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/nrs-context - Update the NRSContext instance
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = updateNRSContextSchema.parse(body);

    const updatedNRSContext = await dbApi.updateNRSContext(validatedData);

    if (!updatedNRSContext) {
      return NextResponse.json({ error: "NRSContext not found" }, { status: 404 });
    }

    return NextResponse.json(updatedNRSContext);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
