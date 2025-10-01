"use client";

import { Entry, EntryProgress } from "@/generated/prisma";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EntryWithProgress extends Entry {
  progress: EntryProgress | null;
}

interface EntryListApiResponse {
  entries: EntryWithProgress[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface EntryListPageProps {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default function EntryListPage({ searchParams }: EntryListPageProps) {
  const router = useRouter();
  const [params, setParams] = useState<{ page?: string; pageSize?: string }>({});
  useEffect(() => {
    (async () => {
      const resolved = await searchParams;
      setParams(resolved);
    })();
  }, [searchParams]);
  const page = parseInt(params.page || "1");
  const pageSize = parseInt(params.pageSize || "10");

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setActiveSearch(search);
    }
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value);
    router.push(`/entries?page=1&pageSize=${newPageSize}`);
  };

  return (
    <div className="container mx-auto p-4 flex-1 flex flex-col">
      <Card className="w-full flex-1 flex flex-col">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-2xl font-bold text-white">NRS rankings</h1>
            </div>
            <div className="flex items-center gap-4 flex-wrap min-w-[300px]">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search by title..."
                className="border rounded px-3 py-2 w-64 text-base bg-white dark:bg-neutral-900 text-black dark:text-white"
              />
              <Link href="/entries/new">
                <Button variant="default">+ New Entry</Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <EntriesTable page={page} pageSize={pageSize} search={activeSearch} handlePageSizeChange={handlePageSizeChange} />
        </CardContent>
      </Card>
    </div>
  );
}


function EntriesTable({ page, pageSize, search, handlePageSizeChange }: { page: number; pageSize: number; search: string; handlePageSizeChange: (value: string) => void }) {
  const [apiResponse, setApiResponse] = useState<EntryListApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchEntries() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });
        if (search.trim()) {
          params.append("search", search.trim());
        }
        const res = await fetch(`http://localhost:3000/api/entries?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: EntryListApiResponse = await res.json();
        setApiResponse(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchEntries();
  }, [page, pageSize, search]);

  if (loading) return (
    <div className="flex items-center justify-center flex-1">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>Loading...</CardHeader>
      </Card>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center flex-1">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>Error</CardHeader>
        <CardContent>{error}</CardContent>
      </Card>
    </div>
  );

  const entries = apiResponse?.entries || [];
  const hasNextPage = apiResponse?.hasNextPage || false;
  const hasPreviousPage = apiResponse?.hasPreviousPage || false;

  return (
    <>
      <div className="flex flex-col flex-1 overflow-x-auto">
        <Table className="mx-auto h-full" containerClassName="flex flex-1">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-16">Rank</TableHead>
              <TableHead className="text-left">Title</TableHead>
              <TableHead className="text-center w-24">Score</TableHead>
              <TableHead className="text-center w-48">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(entries) && entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                  No entries found.
                </TableCell>
              </TableRow>
            ) : (
              Array.isArray(entries) && entries.map((entry, index) => {
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
                  <TableRow key={entry.id}>
                    <TableCell className="text-center">
                      <span className={`font-black ${rankFontSizeClass}`}>{rank}</span>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center">
                        {/* Placeholder for image if available */}
                        {/* <img className="w-10 h-10 rounded-full mr-3" src="entry.image" alt="Entry Image" /> */}
                        <div>
                          <Link href={`/entries/${entry.id}`}>
                            <span className="text-blue-600 hover:underline font-bold text-base">
                              {entry.title}
                            </span>
                          </Link>
                          <p className="text-gray-400 text-xs">ID: {entry.id}</p>
                          {entry.bestGirl && <p className="text-gray-400 text-xs">Best Girl: {entry.bestGirl}</p>}
                          {entryType !== 'N/A' && <p className="text-gray-400 text-xs">Type: {entryType as string}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-yellow-400 text-lg">★</span> N/A
                    </TableCell>
                    <TableCell className="text-center">
                      {entry.progress ? (
                        <span className="bg-green-200 text-green-600 py-1 px-3 rounded-full text-xs">
                          {entry.progress.status}
                        </span>
                      ) : (
                        <span className="bg-red-200 text-red-600 py-1 px-3 rounded-full text-xs">
                          No Progress
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="pageSize" className="mr-2 text-gray-700">Items per page:</label>
          <Select value={pageSize.toString()} onValueChange={value => handlePageSizeChange(value)}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/entries/new">
            <Button variant="default">+ New Entry</Button>
          </Link>
        </div>
        <div className="flex space-x-2">
          {hasPreviousPage && (
            <Link href={`/entries?page=${Math.max(1, page - 1)}&pageSize=${pageSize}`}>
              <Button variant="outline">Previous</Button>
            </Link>
          )}
          {hasNextPage && (
            <Link href={`/entries?page=${page + 1}&pageSize=${pageSize}`}>
              <Button variant="outline">Next</Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
// ...existing code...
}
