import { NextResponse, NextRequest } from "next/server";
import * as dbApi from "@/lib/db_api";
import { z } from "zod";

// Schema for updating an Impact
const updateImpactSchema = z.object({
  name: z.string().optional(),
  scoreVector: z.record(z.string(), z.number()).optional(),
  dah_meta: z.record(z.string(), z.unknown()).optional(),
});

// GET /api/impacts/[id] - Get a single impact by ID
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const impact = await dbApi.getImpact(id);

    if (!impact) {
      return NextResponse.json({ error: "Impact not found" }, { status: 404 });
    }

    return NextResponse.json(impact);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/impacts/[id] - Update an impact by ID
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const validatedData = updateImpactSchema.parse(body);

    const updatedImpact = await dbApi.updateImpact(id, validatedData);

    if (!updatedImpact) {
      return NextResponse.json({ error: "Impact not found" }, { status: 404 });
    }

    return NextResponse.json(updatedImpact);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// DELETE /api/impacts/[id] - Delete an impact by ID
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const deletedImpact = await dbApi.deleteImpact(id);

    if (!deletedImpact) {
      return NextResponse.json({ error: "Impact not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Impact deleted successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}