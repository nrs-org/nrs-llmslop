"use client";

import { Entry, Impact, Relation, EntryProgress, ImpactContribution, RelationContribution, EntryType } from "@/generated/prisma";
import React, { useState, useRef } from "react";
import {
  resolveAnimangaInfo,
  resolveAnimeInfo,
  resolveMangaInfo,
} from "@/lib/animanga";
interface EntryDetailsPageProps {
  params: Promise<{ id: string }>;
}

import { Fragment } from "react";
import DOMPurify from "dompurify";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { getSupportedSourceType, parseSourceType, SupportedSourceTypeName } from "@/lib/sourceProcessing";
// Helper to extract and format additional sources from dah_meta
function getAdditionalSources(meta: any): any {
  if (!meta || typeof meta !== "object") return null;
  return meta.DAH_additional_sources || null;
}

const sourceFieldMap = [
  {
    key: "id_MyAnimeList",
    type: "MAL",
    url: (idFragments: string[], entryType: EntryType) => {
      let typePath = "anime";
      if (entryType === EntryType.Manga || entryType === EntryType.LightNovel) typePath = "manga";
      return `https://myanimelist.net/${typePath}/${idFragments[0]}`;
    },
  },
  {
    key: "id_AniList",
    type: "AL",
    url: (idFragments: string[], entryType: EntryType) => {
      let typePath = "anime";
      if (entryType === EntryType.Manga || entryType === EntryType.LightNovel) typePath = "manga";
      return `https://anilist.co/${typePath}/${idFragments[0]}`;
    },
  },
  {
    key: "id_Kitsu",
    type: "KS",
    url: (idFragments: string[], entryType: EntryType) => {
      let typePath = "anime";
      if (entryType === EntryType.Manga || entryType === EntryType.LightNovel) typePath = "manga";
      return `https://kitsu.io/${typePath}/${idFragments[0]}`;
    },
  },
  {
    key: "id_AniDB",
    type: "ADB",
    url: (idFragments: string[], entryType: EntryType) => {
      let typePath = "anime";
      if (entryType === EntryType.Manga || entryType === EntryType.LightNovel) typePath = "manga";
      return `https://anidb.net/${typePath}/${idFragments[0]}`;
    },
  },
  {
    key: "id_VNDB",
    type: "VNDB",
    url: (idFragments: string[], entryType: EntryType) => `https://vndb.org/v${idFragments[0]}`,
  },
  // VGMDB sources
  { key: "vgmdb.artist", type: "VGMDB", url: (idFragments: string[]) => `https://vgmdb.net/artist/${idFragments[0]}` },
  { key: "vgmdb.album", type: "VGMDB", url: (idFragments: string[]) => `https://vgmdb.net/album/${idFragments[0]}` },
  { key: "vgmdb.track", type: "VGMDB", url: (idFragments: string[]) => `https://vgmdb.net/album/${idFragments[0]}` }, // fallback to album
  // YouTube sources
  { key: "youtube.video", type: "YT", url: (idFragments: string[]) => `https://youtube.com/watch?v=${idFragments[0]}` },
  { key: "youtube.playlist", type: "YT", url: (idFragments: string[]) => `https://youtube.com/playlist?list=${idFragments[0]}` },
  { key: "youtube.user", type: "YT", url: (idFragments: string[]) => `https://youtube.com/${idFragments[0]}` },
];

function renderSourceButtons(sources: any, entryType: EntryType) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {sourceFieldMap.map(cfg => {
        let idFragments: string[] = [];
        let pseudoUrl = "";
        // MAL, AL, Kitsu, AniDB
        if (["id_MyAnimeList", "id_AniList", "id_Kitsu", "id_AniDB"].includes(cfg.key) && (typeof sources?.[cfg.key] === "string" || typeof sources?.[cfg.key] === "number")) {
          idFragments = [String(sources[cfg.key])];
          let typePath = "anime";
          if (entryType === "Manga" || entryType === "LightNovel") typePath = "manga";
          pseudoUrl = `/${typePath}/${idFragments[0]}`;
        }
        // VNDB
        if (cfg.key === "id_VNDB" && (typeof sources?.[cfg.key] === "string" || typeof sources?.[cfg.key] === "number")) {
          idFragments = [String(sources[cfg.key])];
          pseudoUrl = `/v${idFragments[0]}`;
        }
        // VGMDB
        if (cfg.key === "vgmdb.artist" && sources?.vgmdb?.artist) {
          idFragments = [String(sources.vgmdb.artist)];
          pseudoUrl = `/artist/${idFragments[0]}`;
        }
        if (cfg.key === "vgmdb.album" && sources?.vgmdb?.album) {
          idFragments = [String(sources.vgmdb.album)];
          pseudoUrl = `/album/${idFragments[0]}`;
        }
        if (cfg.key === "vgmdb.track" && sources?.vgmdb?.album && sources?.vgmdb?.track) {
          idFragments = [String(sources.vgmdb.album), String(sources.vgmdb.track)];
          pseudoUrl = `/album/${idFragments[0]}/track/${idFragments[1]}`;
        }
        // YouTube
        if (cfg.key === "youtube.video" && sources?.youtube?.video) {
          idFragments = [String(sources.youtube.video)];
          pseudoUrl = `/watch?v=${idFragments[0]}`;
        }
        if (cfg.key === "youtube.playlist" && sources?.youtube?.playlist) {
          idFragments = [String(sources.youtube.playlist)];
          pseudoUrl = `/playlist?list=${idFragments[0]}`;
        }
        if (cfg.key === "youtube.user" && sources?.youtube?.channelId) {
          idFragments = ["channel", String(sources.youtube.channelId)];
          pseudoUrl = `/channel/${idFragments[1]}`;
        }
        if (cfg.key === "youtube.user" && sources?.youtube?.channelHandle) {
          idFragments = ["@" + String(sources.youtube.channelHandle)];
          pseudoUrl = `/@${sources.youtube.channelHandle}`;
        }
        if (idFragments.length === 0) return null;
        const spec = getSupportedSourceType(cfg.type as SupportedSourceTypeName);
        const href = cfg.url(idFragments, entryType);
        return (
          <a
            key={cfg.key + "-" + idFragments.join("-")}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-gray-100 dark:bg-neutral-900 hover:bg-gray-200 dark:hover:bg-neutral-800 border text-sm font-medium shadow"
            title={spec?.name || cfg.key}
          >
            <img src={spec?.icon || ""} alt={spec?.name || cfg.key} className="w-5 h-5" />
            <span>{pseudoUrl}</span>
          </a>
        );
      })}
    </div>
  );
}

function renderUrlTable(urls: any[]) {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return null;
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="text-left font-semibold">Name</th>
          <th className="text-left font-semibold">URL</th>
        </tr>
      </thead>
      <tbody>
        {urls.map((u: any, i: number) => (
          <tr key={i}>
            <td className="py-1 pr-2">{u.name}</td>
            <td className="py-1"><a href={u.src} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{u.src}</a></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
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
  const [populateLoading, setPopulateLoading] = useState(false);
  const [populateError, setPopulateError] = useState<string | null>(null);
  const [populateSuccess, setPopulateSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  async function handlePopulateId() {
    if (!entry) return;
    setPopulateLoading(true);
    setPopulateError(null);
    setPopulateSuccess(false);
    try {
      // Call the new populate API endpoint
      const res = await fetch(`/api/entries/${entry.id}/populate`, {
        method: "POST"
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || "Failed to populate entry");
      }
      // Refresh entry
      setPopulateSuccess(true);
      setError(null);
      setTimeout(() => setPopulateSuccess(false), 3000);
      // Refetch entry data
      const refreshed = await fetch(`/api/entries/${entry.id}`, { cache: "no-store" });
      const refreshedData = await refreshed.json();
      setEntry(refreshedData);
      setNewTitle(refreshedData?.title || "");
    } catch (err: any) {
      setPopulateError(err.message || "Unknown error");
    } finally {
      setPopulateLoading(false);
    }
  }

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

  const resolvedAnimangaInfo = (entry.dah_meta as any)?.DAH_animanga_info
    ? resolveAnimangaInfo((entry.dah_meta as any).DAH_animanga_info)
    : null;

  const resolvedAnimeInfo = (entry.dah_meta as any)?.DAH_anime_info
    ? resolveAnimeInfo((entry.dah_meta as any).DAH_anime_info)
    : null;

  const resolvedMangaInfo = (entry.dah_meta as any)?.DAH_manga_info
    ? resolveMangaInfo((entry.dah_meta as any).DAH_manga_info)
    : null;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center gap-2">
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 font-medium shadow"
          onClick={handlePopulateId}
          disabled={populateLoading}
        >
          {populateLoading ? "Populating..." : "Populate IDs & Metadata"}
        </button>
        {populateError && <span className="text-red-500 ml-2">{populateError}</span>}
        {populateSuccess && <span className="text-green-600 ml-2">Populated!</span>}
      </div>
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
      <p className="text-gray-500 italic">{entry.id}</p>
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

      {/* Additional Sources Section (from DAH_meta) */}
      {entry.dah_meta && getAdditionalSources(entry.dah_meta) && (
        <div className="mt-4 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">Additional Sources</h2>
          {renderSourceButtons(getAdditionalSources(entry.dah_meta), entry.entryType)}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="urls">
              <AccordionTrigger>Extra Sources</AccordionTrigger>
              <AccordionContent>
                {Array.isArray(getAdditionalSources(entry.dah_meta)?.urls) && getAdditionalSources(entry.dah_meta)?.urls.length > 0
                  ? renderUrlTable(getAdditionalSources(entry.dah_meta)?.urls)
                  : <div className="text-gray-500 italic py-2">No extra sources available.</div>
                }
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

      {/* General Information Card from DAH_..._info */}
      {(resolvedAnimangaInfo || resolvedAnimeInfo || resolvedMangaInfo) && (() => {
        const info = resolvedAnimangaInfo;
        const animeInfo = resolvedAnimeInfo;
        const mangaInfo = resolvedMangaInfo;

        // Basic HTML sanitizer for description
        function sanitizeHtml(html: string) {
          return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
        }
        // Helper to format anime season
        function formatAnimeSeason(seasonObj: any) {
          if (!seasonObj || typeof seasonObj !== "object") return null;
          const season = seasonObj.season ? String(seasonObj.season).toUpperCase() : "";
          const year = seasonObj.year ? String(seasonObj.year) : "";
          // Capitalize season
          const seasonName = season.charAt(0) + season.slice(1).toLowerCase();
          return seasonName && year ? `${seasonName} ${year}` : null;
        }
        // Helper to title-case array
        function toTitleCaseArray(arr: string[]): string[] {
          return arr.map(str => str.replace(/\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1)));
        }
        // Helper to format duration in seconds
        function formatDuration(seconds: number): string {
          if (isNaN(seconds) || seconds <= 0) return "";
          if (seconds < 60) return `${seconds} sec`;
          if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
          const h = Math.floor(seconds / 3600);
          const m = Math.round((seconds % 3600) / 60);
          return `${h} hr${h > 1 ? "s" : ""}${m > 0 ? ` ${m} min` : ""}`;
        }
        // Helper to format type enum
        function formatType(type: string): string {
          switch (type) {
            case "TV": return "TV";
            case "MOVIE": return "Movie";
            case "OVA": return "OVA";
            case "ONA": return "ONA";
            case "SPECIAL": return "Special";
            case "UNKNOWN": return "Unknown";
            default: return type;
          }
        }
        function formatStatus(status: string): string {
          switch (status) {
            case "FINISHED": return "Finished";
            case "ONGOING": return "Ongoing";
            case "UPCOMING": return "Upcoming";
            case "UNKNOWN": return "Unknown";
            default: return status;
          }
        }
        return (
          <div className="mt-4 p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">General Information</h2>
            <div className="flex flex-col md:flex-row gap-6">
              {/* Picture/Thumbnail + short info */}
              <div className="flex-shrink-0 flex flex-col items-start justify-start w-full md:w-1/3 gap-4">
                <div className="w-full max-w-xs flex flex-col items-center mx-auto">
                  {(info?.picture || info?.thumbnail) && (
                    <>
                      {info.picture && (
                        <img src={info.picture} alt="Picture" className="w-full rounded-lg shadow mb-2" style={{ objectFit: 'cover' }} />
                      )}
                      {!info.picture && info.thumbnail && (
                        <img src={info.thumbnail} alt="Thumbnail" className="w-full rounded-lg shadow mb-2" style={{ objectFit: 'cover' }} />
                      )}
                    </>
                  )}
                  {/* Short info: type, status, etc. */}
                  <div className="flex flex-col gap-2 w-full m-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
                      {info?.type && <><span className="text-gray-500 font-medium text-right">Type:</span><span className="font-semibold text-gray-900 dark:text-white">{formatType(info.type)}</span></>}
                      {info?.status && <><span className="text-gray-500 font-medium text-right">Status:</span><span className="font-semibold text-gray-900 dark:text-white">{formatStatus(info.status)}</span></>}
                      {animeInfo?.animeSeason && <><span className="text-gray-500 font-medium text-right">Anime Season:</span><span className="font-semibold text-gray-900 dark:text-white">{formatAnimeSeason(animeInfo.animeSeason)}</span></>}
                      {animeInfo?.episodes !== undefined && <><span className="text-gray-500 font-medium text-right">Episodes:</span><span className="font-semibold text-gray-900 dark:text-white">{animeInfo.episodes}</span></>}
                      {mangaInfo?.chapters !== undefined && <><span className="text-gray-500 font-medium text-right">Chapters:</span><span className="font-semibold text-gray-900 dark:text-white">{mangaInfo.chapters}</span></>}
                      {mangaInfo?.volumes !== undefined && <><span className="text-gray-500 font-medium text-right">Volumes:</span><span className="font-semibold text-gray-900 dark:text-white">{mangaInfo.volumes}</span></>}
                      {animeInfo?.duration && typeof animeInfo.duration === "object" && <><span className="text-gray-500 font-medium text-right">Duration:</span><span className="font-semibold text-gray-900 dark:text-white">{formatDuration(Number((animeInfo.duration as any).value))}</span></>}
                      {animeInfo?.duration && typeof animeInfo.duration !== "object" && typeof animeInfo.duration !== "undefined" && <><span className="text-gray-500 font-medium text-right">Duration:</span><span className="font-semibold text-gray-900 dark:text-white">{formatDuration(Number(animeInfo.duration))}</span></>}
                    </div>
                  </div>
                </div>
              </div>
              {/* Main info: title, description, synonyms, tags, scores, studios, producers */}
              <div className="flex-1 flex flex-col gap-4">
                {/* Title (if present) */}
                {info?.title && <h3 className="text-2xl font-bold mb-2">{info.title}</h3>}
                {/* Description (HTML, sanitized) */}
                {info?.description && (
                  <div className="mb-4">
                    <div className="font-semibold mb-1">Description</div>
                    <div className="bg-gray-50 dark:bg-neutral-900 p-3 rounded text-base" style={{ minHeight: '120px' }}
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(info.description) }}
                    />
                  </div>
                )}
                {/* Studios as tag list or accordion (moved to right column) */}
                {animeInfo && Array.isArray(animeInfo.studios) && animeInfo.studios.length > 0 && (
                  animeInfo.studios.length > 5 ? (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="studios">
                        <AccordionTrigger>Studios ({animeInfo.studios.length})</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap gap-2 py-2">
                            {toTitleCaseArray(animeInfo.studios).map((studio: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 rounded bg-green-200 dark:bg-green-800 text-xs font-medium shadow">{studio}</span>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div className="flex flex-wrap gap-2 items-center w-full">
                      Studios:
                      {toTitleCaseArray(animeInfo.studios).map((studio: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded bg-green-200 dark:bg-green-800 text-xs font-medium shadow">{studio}</span>
                      ))}
                    </div>
                  )
                )}
                {/* Producers as tag list or accordion (moved to right column) */}
                {animeInfo && Array.isArray(animeInfo.producers) && animeInfo.producers.length > 0 && (
                  animeInfo.producers.length > 5 ? (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="producers">
                        <AccordionTrigger>Producers ({animeInfo.producers.length})</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap gap-2 py-2">
                            {toTitleCaseArray(animeInfo.producers).map((producer: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 rounded bg-blue-200 dark:bg-blue-800 text-xs font-medium shadow">{producer}</span>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div className="flex flex-wrap gap-2 items-center w-full">
                      Producers:
                      {toTitleCaseArray(animeInfo.producers).map((producer: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded bg-blue-200 dark:bg-blue-800 text-xs font-medium shadow">{producer}</span>
                      ))}
                    </div>
                  )
                )}
                {/* Synonyms */}
                {info && Array.isArray(info.synonyms) && info.synonyms.length > 0 && (
                  info.synonyms.length > 5 ? (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="synonyms">
                        <AccordionTrigger>Synonyms ({info.synonyms.length})</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap gap-2 py-2">
                            {info.synonyms.map((syn: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-xs font-medium shadow">{syn}</span>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div className="flex flex-wrap gap-2 items-center w-full">
                      Synonyms:
                      {info.synonyms.map((syn: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-800 text-xs font-medium shadow">{syn}</span>
                      ))}
                    </div>
                  )
                )}
                {/* Tags */}
                {info && Array.isArray(info.tags) && info.tags.length > 0 && (
                  info.tags.length > 5 ? (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="tags">
                        <AccordionTrigger>Tags ({info.tags.length})</AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-wrap gap-2 py-2">
                            {info.tags.map((tag: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 rounded bg-gray-200 dark:bg-neutral-800 text-xs font-medium">{tag}</span>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <div className="flex flex-wrap gap-2 items-center w-full">
                      Tags:
                      {info.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 rounded bg-gray-200 dark:bg-neutral-800 text-xs font-medium">{tag}</span>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        );
      })()}
      {/* Raw DAH Meta for debugging */}
      {entry.dah_meta && (
        <div className="mt-4 p-4 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold">DAH Meta (Raw)</h2>
          <pre className="bg-gray-100 dark:bg-neutral-900 p-2 rounded-md overflow-auto">
            {JSON.stringify(entry.dah_meta, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
}
