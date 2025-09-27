import { NextResponse, NextRequest } from "next/server";
import * as dbApi from "@/lib/db_api";
import { ImpactCreateDTO } from "@/lib/db_types";
import { z } from "zod";

// Schema for creating an Impact
const createImpactSchema = z.object({
  id: z.string(),
  name: z.string(),
  scoreVector: z.any(),
  dah_meta: z.any().optional(),
});

// GET /api/impacts - Get a paginated list of impacts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const impacts = await dbApi.getImpacts(page, pageSize);
    return NextResponse.json(impacts);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/impacts - Create a new impact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createImpactSchema.parse(body);

    const newImpact = await dbApi.createImpact(validatedData as ImpactCreateDTO);

    return NextResponse.json(newImpact, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}
