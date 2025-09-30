import { prisma } from "@/lib/db";
import { Entry } from "@prisma/client";

export interface CreateEntryInput {
  id: string;
  title: string;
}

export async function createEntry(input: CreateEntryInput): Promise<Entry> {
  const { id, title } = input;
  return prisma.entry.create({
    data: {
      id,
      title,
    },
  });
}
