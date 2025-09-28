import { NextResponse, NextRequest } from "next/server";
import { DbApi } from "@/lib/db_api";
import { RelationCreateDTO } from "@/lib/db_types";
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();
const dbApi = new DbApi(prisma);

// Schema for creating a Relation
const createRelationSchema = z.object({
  id: z.string(),
  name: z.string(),
  dah_meta: z.any().optional(),
});

// GET /api/relations - Get a paginated list of relations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    const relations = await dbApi.getRelations(page, pageSize);
    return NextResponse.json(relations);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST /api/relations - Create a new relation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createRelationSchema.parse(body);

    const newRelation = await dbApi.createRelation(validatedData as RelationCreateDTO);

    return NextResponse.json(newRelation, { status: 201 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}