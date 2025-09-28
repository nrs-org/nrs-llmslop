import { NextResponse, NextRequest } from "next/server";
import { DbApi } from "@/lib/db_api";
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();
const dbApi = new DbApi(prisma);

// Schema for updating a Relation
const updateRelationSchema = z.object({
  name: z.string().optional(),
  dah_meta: z.any().optional(),
});

// GET /api/relations/[id] - Get a single relation by ID
export async function GET(request: NextRequest, context: { params: Promise<{ id: string; }>; }): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const relation = await dbApi.getRelation(id);

    if (!relation) {
      return NextResponse.json({ error: "Relation not found" }, { status: 404 });
    }

    return NextResponse.json(relation);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/relations/[id] - Update a relation by ID
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = updateRelationSchema.parse(body);

    const updatedRelation = await dbApi.updateRelation(id, validatedData);

    if (!updatedRelation) {
      return NextResponse.json({ error: "Relation not found" }, { status: 404 });
    }

    return NextResponse.json(updatedRelation);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// DELETE /api/relations/[id] - Delete a relation by ID
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const deletedRelation = await dbApi.deleteRelation(id);

    if (!deletedRelation) {
      return NextResponse.json({ error: "Relation not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Relation deleted successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
