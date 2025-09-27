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

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Best Girl</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Entry Type</th>
              <th className="py-2 px-4 border-b">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const entryType = entry.dah_meta && typeof entry.dah_meta === 'object' && 'DAH_entry_type' in entry.dah_meta ? entry.dah_meta.DAH_entry_type : 'N/A';
              return (
                <tr key={entry.id}>
                  <td className="py-2 px-4 border-b">
                    <Link href={`/entries/${entry.id}`}>
                      <span className="text-blue-600 hover:underline">
                        {entry.id}
                      </span>
                    </Link>
                  </td>
                  <td className="py-2 px-4 border-b">{entry.title}</td>
                  <td className="py-2 px-4 border-b">{entry.bestGirl || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{entry.progress?.status || 'N/A'}</td>
                  <td className="py-2 px-4 border-b">{entryType as string}</td>
                  <td className="py-2 px-4 border-b">N/A</td> {/* Placeholder for score */}
                </tr>
              );
            })}
          </tbody>
        </table>
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
