// DAH_entry_id_impl logic for ID validation and parsing
// This module centralizes all entry ID handling

import { parseSourceType, SupportedSourceType } from "./sourceProcessing";

// Spec notation:
// Standard: [TypePrefix, DatabaseID, SubTypePrefix*, EntryIDInDatabase, Suffix*]
// Custom:   [TypePrefix, Timestamp, Suffix*]

export type StandardIdComponents = {
  kind: "standard";
  typePrefix: string;
  sourceType: SupportedSourceType;
  subTypePrefix?: string;
  entryIdInDatabase: string;
  suffix?: string;
};

export type CustomIdComponents = {
  kind: "custom";
  typePrefix: string;
  timestamp: string;
  suffix?: string;
};

export type ParsedEntryId = StandardIdComponents | CustomIdComponents;

// Regex for DAH_entry_id_impl (excluding null entry)
const ENTRY_ID_REGEX = /^(-\d+|OU-[A-Z0-9-]*|(GF|[AMLVFGO])-((MAL|AL|ADB|KS|VNDB|VGMDB|VGMDB-AL|VGMDB-AR)-\d+(-\d+)?|\d{8}T\d{6})(-\d+)?$)/;

export function isValidEntryId(id: string): boolean {
  return ENTRY_ID_REGEX.test(id);
}

export function parseEntryId(id: string): ParsedEntryId {
  // Try to match the regex
  const match = id.match(ENTRY_ID_REGEX);
  if (!match) throw new Error(`Entry ID does not match DAH_entry_id_impl spec: ${id}`);

  // Standard ID: [TypePrefix, DatabaseID, SubTypePrefix*, EntryIDInDatabase, Suffix*]
  // Example: A-MAL-12345, M-VGMDB-AL-89363-2
  const standardMatch = id.match(/^([A-Z]{1,2})-([A-Z]+(?:-[A-Z]+)*)-(\d+)(-(\d+))?$/);
  if (standardMatch) {
    const [_, typePrefix, dbIdRaw, entryIdInDb, suffixRaw, suffix] = standardMatch;
    // dbIdRaw may contain subtype, e.g. VGMDB-AL
    const dbIdParts = dbIdRaw.split("-");
    const databaseId = dbIdParts[0];
    const sourceType = parseSourceType(databaseId);
    if(sourceType === undefined) {
        throw new Error(`Unrecognized source type prefix in ID: ${databaseId}`);
    }
    const subTypePrefix = dbIdParts.length > 1 ? dbIdParts.slice(1).join("-") : undefined;
    return {
      kind: "standard",
      typePrefix,
      sourceType,
      subTypePrefix,
      entryIdInDatabase: entryIdInDb,
      suffix: suffix,
    };
  }

  // Custom ID: [TypePrefix, Timestamp, Suffix*]
  // Example: A-20070405T143050, G-20231001T120000-1
  const customMatch = id.match(/^([A-Z]{1,2})-(\d{8}T\d{6})(-(\d+))?$/);
  if (customMatch) {
    const [_, typePrefix, timestamp, suffixRaw, suffix] = customMatch;
    return {
      kind: "custom",
      typePrefix,
      timestamp,
      suffix,
    };
  }

  throw new Error(`Failed to parse entry ID: ${id}`);
}
