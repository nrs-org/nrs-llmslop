"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";

import React, { useState } from "react";
import { detectSource } from "@/components/SourceIndicator";
import { SourceIndicator } from "@/components/SourceIndicator";


export default function NewEntryPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [entryType, setEntryType] = useState<string>("");
  const [customId, setCustomId] = useState("");

  function isValidUrl(str: string) {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  }

  function autoDetectType(url: string): string {
    if (!isValidUrl(url)) return "";
    if (/myanimelist|anilist|kitsu|anidb/.test(url)) return "Anime";
    if (/vndb/.test(url)) return "VisualNovel";
    if (/vgmdb/.test(url)) {
      if (/album/.test(url)) return "MusicAlbum";
      if (/artist/.test(url)) return "MusicArtist";
      return "MusicGeneric";
    }
    if (/youtube/.test(url)) return "MusicTrack";
    if (/spotify/.test(url)) return "MusicTrack";
    return "Other";
  }

  function autoGenId(type: string, url: string): string {
    // Basic implementation based on DAH_entry_id_impl spec
    if (!isValidUrl(url)) {
      // Custom ID: type only (timestamp removed temporarily)
      return `${type}`;
    }
    // Example: Anime-MAL-12345
    if (/myanimelist\.net\/anime\/(\d+)/.test(url)) {
      const m = url.match(/myanimelist\.net\/anime\/(\d+)/);
      return `A-MAL-${m?.[1]}`;
    }
    if (/anilist\.co\/anime\/(\d+)/.test(url)) {
      const m = url.match(/anilist\.co\/anime\/(\d+)/);
      return `A-AL-${m?.[1]}`;
    }
    if (/kitsu\.io\/anime\/(\d+)/.test(url)) {
      const m = url.match(/kitsu\.io\/anime\/(\d+)/);
      return `A-KS-${m?.[1]}`;
    }
    if (/anidb\.net\/anime\/(\d+)/.test(url)) {
      const m = url.match(/anidb\.net\/anime\/(\d+)/);
      return `A-ADB-${m?.[1]}`;
    }
    if (/vndb\.org\/(v\d+)/.test(url)) {
      const m = url.match(/vndb\.org\/(v\d+)/);
      return `V-VNDB-${m?.[1]}`;
    }
    if (/vgmdb\.net\/album\/(\d+)/.test(url)) {
      const m = url.match(/vgmdb\.net\/album\/(\d+)/);
      return `M-VGMDB-AL-${m?.[1]}`;
    }
    if (/vgmdb\.net\/artist\/(\d+)/.test(url)) {
      const m = url.match(/vgmdb\.net\/artist\/(\d+)/);
      return `M-VGMDB-AR-${m?.[1]}`;
    }
    // fallback
    return `${type}`;
  }

  const source = detectSource(url);
  const validUrl = isValidUrl(url);
  const detectedType = autoDetectType(url);
  const entryTypeValue = entryType || detectedType;
  const entryIdValue = customId || autoGenId(entryTypeValue, url);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Compose entry data
      const entryData: any = {
        id: entryIdValue,
        title: validUrl ? `Imported from ${url}` : customName || "Untitled",
        entryType: entryTypeValue,
        url: validUrl ? url : undefined,
        name: !validUrl ? customName : undefined,
      };
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entryData),
      });
      if (!res.ok) throw new Error("Failed to create entry");
      router.push("/entries");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center flex-1 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-xl font-bold">Create New Entry</h2>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-1">Import URL</label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Paste entry URL here"
              />
              <SourceIndicator url={url} />
            </div>
            {!validUrl && (
              <div>
                <label htmlFor="customName" className="block text-sm font-medium mb-1">Name</label>
                <input
                  id="customName"
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Entry name (required for unknown URL)"
                  required
                />
              </div>
            )}
            <div>
              <label htmlFor="entryType" className="block text-sm font-medium mb-1">Entry Type</label>
              <select
                id="entryType"
                value={entryTypeValue}
                onChange={e => setEntryType(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Auto ({detectedType || "Other"})</option>
                <option value="Anime">Anime</option>
                <option value="Manga">Manga</option>
                <option value="LightNovel">Light Novel</option>
                <option value="VisualNovel">Visual Novel</option>
                <option value="MusicAlbum">Music Album</option>
                <option value="MusicArtist">Music Artist</option>
                <option value="MusicTrack">Music Track</option>
                <option value="Franchise">Franchise</option>
                <option value="Game">Game</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="entryId" className="block text-sm font-medium mb-1">Entry ID</label>
              <input
                id="entryId"
                type="text"
                value={entryIdValue}
                onChange={e => setCustomId(e.target.value)}
                className="w-full border rounded px-3 py-2 font-mono"
                placeholder="Auto-generated or custom entry ID"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Importing..." : "Import Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
