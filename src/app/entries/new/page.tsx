"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";

import React, { useState, useEffect } from "react";
import { getTypeFromPrefix, autoGenId, getEntryTypeName } from "@/lib/entryTypes";
// Removed react-transition-group (CSSTransition)
import { SourceIndicator } from "@/components/SourceIndicator";
import { detectSourceType } from "@/lib/sourceProcessing";
import { parseEntryId } from "@/lib/entryId";
import { EntryType } from "@/generated/prisma";


export default function NewEntryPage() {
    const router = useRouter();
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [customName, setCustomName] = useState("");
    const [entryType, setEntryType] = useState<EntryType>(EntryType.Other);
    const [customId, setCustomId] = useState("");
    const [autoId, setAutoId] = useState("");

    function isValidUrl(str: string) {
        try {
            new URL(str);
            return true;
        } catch {
            return false;
        }
    }

    const source = detectSourceType(url);


    // Auto-update ID and entry type when URL changes
    useEffect(() => {
        const generatedId = autoGenId(entryType, url);
        setAutoId(generatedId);
        // If user pastes a URL, auto-detect entry type and ID
        if (url && isValidUrl(url)) {
            const detectedType = source?.type?.entryType;
            if (detectedType && detectedType !== entryType) {
                setEntryType(detectedType);
            }
            setCustomId(generatedId);
        }
    }, [url]);

    // When entryType changes, regenerate ID based on URL and entryType
    useEffect(() => {
        const generatedId = autoGenId(entryType, url);
        setAutoId(generatedId);
        setCustomId(generatedId);
    }, [entryType]);

    // When ID prefix changes, update entry type accordingly
    useEffect(() => {
        if (customId) {
            const idType = getTypeFromPrefix(customId);
            if (idType && idType !== entryType) {
                setEntryType(idType);
            }
        }
    }, [customId]);

    useEffect(() => {
        if (url && !isValidUrl(url)) {
            setError("Malformed URL. Please enter a valid URL or leave empty for no source.");
            return;
        }
        try {
            if (customId) parseEntryId(customId);
        } catch(error: any) {
            setError(`Invalid entry ID format: ${error.message}`);
            return;
        }
        setError(null);
    }, [url, customId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (loading) return; // Prevent double submit
        setLoading(true);
        setError(null);
        // Error: malformed non-empty URL
        if (url && !isValidUrl(url)) {
            setError("Malformed URL. Please enter a valid URL or leave empty for no source.");
            setLoading(false);
            return;
        }
        // Error: ID prefix mismatch
        if (customId) {
            const prefixTypeCustom = getTypeFromPrefix(customId);
            if (prefixTypeCustom && prefixTypeCustom !== source?.type.entryType) {
                setError(`ID prefix (${customId.split("-")[0]}) does not match entry type (${source?.type.entryType}). Adjusting entry type to ${prefixTypeCustom}.`);
                setEntryType(prefixTypeCustom);
                setLoading(false);
                return;
            }
        }
        try {
            const res = await fetch("/api/entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: customId || autoId,
                    title: isValidUrl(url) ? `Imported from ${url}` : "Untitled",
                    entryType: getTypeFromPrefix(customId) || source?.type.entryType || EntryType.Other,
                    url: isValidUrl(url) && url !== "" ? url : undefined,
                    urlSourceName: source && source.type ? source.type.name : customName,
                }),
            });
            if (!res.ok) {
                let errorMsg = "Failed to create entry";
                try {
                    const data = await res.json();
                    if (data?.error) errorMsg = data.error;
                } catch { }
                throw new Error(errorMsg);
            }
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
                                placeholder="Paste entry URL here (leave empty for no source)"
                            />
                            <SourceIndicator url={url} />
                        </div>
                        <div>
                            <label htmlFor="customName" className="block text-sm font-medium mb-1">URL Key Name</label>
                            <input
                                id="customName"
                                type="text"
                                value={source && source.type && source.type.name ? source.type.name : customName}
                                disabled={!!(source && source.type && source.type.name)}
                                onChange={e => setCustomName(e.target.value)}
                                className="w-full border rounded px-3 py-2"
                                placeholder="Unique name for this URL (required for unknown source)"
                                required={!source || !source.type || !source.type.name}
                            />
                        </div>
                        <div>
                            <label htmlFor="entryType" className="block text-sm font-medium mb-1">Entry Type</label>
                            <select
                                id="entryType"
                                value={entryType}
                                onChange={e => { setEntryType(e.target.value as EntryType); setCustomId(autoGenId(e.target.value as EntryType, url)); }}
                                className="w-full border rounded px-3 py-2"
                            >
                                {Object.values(EntryType).map(type => (<option key={type} value={type}>{getEntryTypeName(type)}</option>))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="entryId" className="block text-sm font-medium mb-1">Entry ID</label>
                            <input
                                id="entryId"
                                type="text"
                                value={customId}
                                onChange={e => setCustomId(e.target.value)}
                                className="w-full border rounded px-3 py-2 font-mono"
                                placeholder="Auto-generated or custom entry ID"
                            />
                        </div>
                        <div className={`text-red-500 text-sm transition-opacity transition-all duration-1000 ${!error ? "opacity-0" : "opacity-100"}`}>{error}</div>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Importing..." : "Import Entry"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
