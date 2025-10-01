"use client";

import { Entry, Impact, Relation, EntryProgress, ImpactContribution, RelationContribution } from "@/generated/prisma";
import React, { useState, useRef } from "react";
interface EntryDetailsPageProps {
  params: Promise<{ id: string }>;
}

interface EntryWithRelations extends Entry {
  progress: EntryProgress | null;
  impacts: (ImpactContribution & { impact: Impact })[];
  relations: (RelationContribution & { relation: Relation })[];
  referencedBy: Array<{ relation: Relation }>;
}

export default function EntryDetailsPage({ params }: EntryDetailsPageProps) {
  const [entry, setEntry] = useState<EntryWithRelations | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { id } = await params;
      const res = await fetch(`/api/entries/${id}`, { cache: "no-store" });
      if (res.status === 404) {
        setNotFound(true);
        setEntry(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setEntry(data);
      setNewTitle(data?.title || "");
      setLoading(false);
    })();
  }, [params]);

  async function handleTitleSave() {
    if (!entry) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/entries/${entry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Failed to update title");
      }
      setEntry({ ...entry, title: newTitle });
      setEditingTitle(false);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="container mx-auto p-4 text-center text-gray-500">Loading...</div>;
  }
  if (notFound) {
    return <div className="container mx-auto p-4 text-center text-red-500">Entry not found</div>;
  }
  if (!entry) {
    return <div className="container mx-auto p-4 text-center text-red-500">Unknown error loading entry</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-3xl font-bold flex-1">
          {editingTitle ? (
            <input
              ref={inputRef}
              className="border rounded px-2 py-1 text-xl font-bold w-full min-w-0"
              style={{ width: "80%" }}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              disabled={loading}
              onKeyDown={e => {
                if (e.key === "Enter" && !loading && newTitle.trim()) {
                  e.preventDefault();
                  handleTitleSave();
                }
              }}
            />
          ) : entry.title}
        </h1>
        {/* Icon button for edit/cancel */}
        <button
          className="ml-2 p-2 border rounded-full text-sm flex items-center justify-center bg-white dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800"
          onClick={() => {
            if (!editingTitle) {
              setEditingTitle(true);
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                  inputRef.current.select();
                }
              }, 0);
            } else {
              setEditingTitle(false);
            }
          }}
          disabled={loading}
          aria-label={editingTitle ? "Cancel" : "Edit Title"}
        >
          {editingTitle ? (
            // X icon for cancel
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
          ) : (
            // Pencil icon for edit
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 010 2.828l-1.586 1.586-2.828-2.828L14.586 2.586a2 2 0 012.828 0zM4 13.586V16h2.414l8.293-8.293-2.828-2.828L4 13.586z" /></svg>
          )}
        </button>
        {editingTitle && (
          <button
            className="ml-2 p-2 border rounded-full text-sm flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700"
            onClick={handleTitleSave}
            disabled={loading || !newTitle.trim()}
            aria-label="Save Title"
          >
            {/* Checkmark icon for save */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-3.293-3.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
          </button>
        )}
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <p>ID: {entry.id}</p>
      {entry.bestGirl && <p>Best Girl: {entry.bestGirl}</p>}

      {entry.progress && (
        <div className="mt-4 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Progress</h2>
          <p>Status: {entry.progress.status}</p>
          {entry.progress.episode && <p>Episode: {entry.progress.episode}</p>}
          {entry.progress.length_seconds && (
            <p>Length (seconds): {entry.progress.length_seconds}</p>
          )}
        </div>
      )}

      {entry.dah_meta && (
        <div className="mt-4 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">DAH Meta</h2>
          <pre className="bg-gray-100 dark:bg-neutral-900 p-2 rounded-md overflow-auto">
            {JSON.stringify(entry.dah_meta, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}