import { NextResponse, NextRequest } from "next/server";
// ...existing code...
import { z } from "zod";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

// Schema for updating an Entry
const updateEntrySchema = z.object({
  title: z.string().optional(),
  bestGirl: z.string().optional(),
  additionalSources: z.any().optional(),
  dah_meta: z.any().optional(),
});

// GET /api/entries/[id] - Get a single entry by ID
export async function GET(request: NextRequest, context: { params: Promise<{ id: string; }>; }): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const entry = await prisma.entry.findUnique({
      where: { id },
      include: { progress: true },
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(entry);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// PUT /api/entries/[id] - Update an entry by ID
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const validatedData = updateEntrySchema.parse(body);

    const updatedEntry = await prisma.entry.update({
      where: { id },
      data: validatedData,
      include: { progress: true },
    });

    return NextResponse.json(updatedEntry);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Prisma throws if not found
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// DELETE /api/entries/[id] - Delete an entry by ID
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    await prisma.entry.delete({ where: { id } });
    return NextResponse.json({ message: "Entry deleted successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    // Prisma throws if not found
    return NextResponse.json({ error: errorMessage }, { status: 404 });
  }
}

// PATCH /api/entries/[id] - Update entry title by ID
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body = await request.json();
    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    const updated = await prisma.entry.update({
      where: { id },
      data: { title: body.title.trim() },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 400 });
  }
}