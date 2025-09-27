import { Entry, EntryProgress } from "@/generated/prisma";
import Link from "next/link";

interface EntryWithProgress extends Entry {
  progress: EntryProgress | null;
}

interface EntryListPageProps {
  searchParams: { page?: string; pageSize?: string };
}

export default async function EntryListPage({ searchParams }: EntryListPageProps) {
  const page = parseInt(searchParams.page || "1");
  const pageSize = parseInt(searchParams.pageSize || "10");

  const res = await fetch(`http://localhost:3000/api/entries?page=${page}&pageSize=${pageSize}`, {
    cache: "no-store",
  });
  const entries: EntryWithProgress[] = await res.json();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Entries</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((entry) => (
          <div key={entry.id} className="border p-4 rounded-lg shadow-sm">
            <Link href={`/entries/${entry.id}`}>
              <h2 className="text-xl font-semibold text-blue-600 hover:underline">
                {entry.title}
              </h2>
            </Link>
            {entry.bestGirl && <p>Best Girl: {entry.bestGirl}</p>}
            {entry.progress && (
              <p>Status: {entry.progress.status}</p>
            )}
            {entry.additionalSources && (
              <p>Sources: {JSON.stringify(entry.additionalSources)}</p>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <Link
          href={`/entries?page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Previous
        </Link>
        <Link
          href={`/entries?page=${page + 1}&pageSize=${pageSize}`}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Next
        </Link>
      </div>
    </div>
  );
}