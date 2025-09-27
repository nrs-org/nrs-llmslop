import { Entry, EntryProgress } from "@/generated/prisma";
import Link from "next/link";

interface EntryWithProgress extends Entry {
  progress: EntryProgress | null;
}

interface EntryListPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function EntryListPage({ searchParams }: EntryListPageProps) {
  const searchParamsResolved = await searchParams;
  const page = parseInt(searchParamsResolved.page || "1");
  const pageSize = parseInt(searchParamsResolved.pageSize || "10");

  const res = await fetch(`http://localhost:3000/api/entries?page=${page}&pageSize=${pageSize}`, {
    cache: "no-store",
  });
  const entries: EntryWithProgress[] = await res.json();

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-white">NRS rankings</h1>

      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full bg-gray-800 text-gray-100">
          <thead>
            <tr className="bg-gray-700 text-gray-200 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-center w-16">Rank</th>
              <th className="py-3 px-6 text-left">Title</th>
              <th className="py-3 px-6 text-center w-24">Score</th>
              <th className="py-3 px-6 text-center w-40">Progress</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 text-sm font-light">
            {entries.map((entry, index) => {
              const rank = (page - 1) * pageSize + index + 1;
              const rankString = rank.toString();
              let rankFontSizeClass = "text-lg";

              if (rankString.length === 1) {
                rankFontSizeClass = "text-2xl";
              } else if (rankString.length === 2) {
                rankFontSizeClass = "text-xl";
              } else if (rankString.length === 3) {
                rankFontSizeClass = "text-lg";
              } else {
                rankFontSizeClass = "text-base";
              }

              const entryType = entry.dah_meta && typeof entry.dah_meta === 'object' && 'DAH_entry_type' in entry.dah_meta ? entry.dah_meta.DAH_entry_type : 'N/A';
              return (
                <tr key={entry.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-6 text-center whitespace-nowrap">
                    <span className={`font-black ${rankFontSizeClass}`}>{rank}</span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="flex items-center">
                      {/* Placeholder for image if available */}
                      {/* <img className="w-10 h-10 rounded-full mr-3" src="entry.image" alt="Entry Image" /> */}
                      <div>
                        <Link href={`/entries/${entry.id}`}>
                          <span className="text-blue-400 hover:underline font-bold text-base">
                            {entry.title}
                          </span>
                        </Link>
                        <p className="text-gray-400 text-xs">ID: {entry.id}</p>
                        {entry.bestGirl && <p className="text-gray-400 text-xs">Best Girl: {entry.bestGirl}</p>}
                        {entryType !== 'N/A' && <p className="text-gray-400 text-xs">Type: {entryType as string}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <span className="text-yellow-400 text-lg">★</span> N/A
                  </td>
                  <td className="py-3 px-6 text-center">
                    {entry.progress ? (
                      <span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs">
                        {entry.progress.status}
                      </span>
                    ) : (
                      <span className="bg-red-200 text-red-600 py-1 px-3 rounded-full text-xs">
                        No Progress
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between mt-4">
        <Link
          href={`/entries?page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Previous
        </Link>
        <Link
          href={`/entries?page=${page + 1}&pageSize=${pageSize}`}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Next
        </Link>
      </div>
    </div>
  );
}
