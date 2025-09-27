import { NextResponse, NextRequest } from "next/server";
import * as dbApi from "@/lib/db_api";
import { z } from "zod";

// Schema for updating an Entry
const updateEntrySchema = z.object({
  title: z.string().optional(),
  bestGirl: z.string().optional(),
  additionalSources: z.record(z.string(), z.unknown()).optional(),
  dah_meta: z.record(z.string(), z.unknown()).optional(),
});

// GET /api/entries/[id] - Get a single entry by ID
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const entry = await dbApi.getEntryDetails(id);

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
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = await request.json();
    const validatedData = updateEntrySchema.parse(body);

    const updatedEntry = await dbApi.updateEntry(id, validatedData);

    if (!updatedEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEntry);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

// DELETE /api/entries/[id] - Delete an entry by ID
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const deletedEntry = await dbApi.deleteEntry(id);

    if (!deletedEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Entry deleted successfully" });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}