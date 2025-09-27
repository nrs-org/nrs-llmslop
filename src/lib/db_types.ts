export enum EntryStatus {
  FINISHED = "FINISHED",
  IN_PROGRESS = "IN_PROGRESS",
  ABANDONED = "ABANDONED",
  PAUSED = "PAUSED",
  NOT_STARTED = "NOT_STARTED",
}

export enum VisualType {
  animated = "animated",
  rpg3dGame = "rpg3dGame",
  animatedShort = "animatedShort",
  animatedMV = "animatedMV",
  visualNovel = "visualNovel",
  manga = "manga",
  animatedGachaCardArt = "animatedGachaCardArt",
  gachaCardArt = "gachaCardArt",
  lightNovel = "lightNovel",
  semiAnimatedMV = "semiAnimatedMV",
  staticMV = "staticMV",
  albumArt = "albumArt",
}

export type ScoreVector = { [key: string]: number };
export type ScoreMatrix = { [key: string]: { [key: string]: number } };

export interface DAHMeta {
  [key: string]: any;
}

export interface EntryCreateDTO {
  id: string;
  title: string;
  bestGirl?: string;
  additionalSources?: DAHMeta;
  dah_meta?: DAHMeta;
}

export interface EntryProgressCreateDTO {
  status: EntryStatus;
  length_seconds?: number;
  episode?: number;
}

export interface ImpactCreateDTO {
  id: string;
  name: string;
  scoreVector: ScoreVector;
  dah_meta?: DAHMeta;
}

export interface RelationCreateDTO {
  id: string;
  name: string;
  dah_meta?: DAHMeta;
}

export interface ImpactContributionCreateDTO {
  contributingWeight: ScoreMatrix;
}

export interface RelationReferenceCreateDTO {
  entryId: string;
  transformMatrix: ScoreMatrix;
}

export interface RelationContributionCreateDTO {
  contributingWeight: ScoreMatrix;
}
