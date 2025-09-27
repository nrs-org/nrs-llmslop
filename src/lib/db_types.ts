import { Prisma, EntryStatus } from "@/generated/prisma";

export type ScoreVector = { [key: string]: number };
export type ScoreMatrix = { [key: string]: { [key: string]: number } };

export type DAHMeta = Prisma.InputJsonValue;

export interface EntryCreateDTO {
  id: string;
  title: string;
  bestGirl?: string;
  additionalSources?: DAHMeta;
  dah_meta?: DAHMeta;
}

export interface EntryUpdateDTO {
  title?: string;
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

export interface ImpactUpdateDTO {
  name?: string;
  scoreVector?: ScoreVector;
  dah_meta?: DAHMeta;
}

export interface RelationCreateDTO {
  id: string;
  name: string;
  dah_meta?: DAHMeta;
}

export interface RelationUpdateDTO {
  name?: string;
  dah_meta?: DAHMeta;
}

export interface NRSContextUpdateDTO {
  factorScoreWeights?: ScoreVector;
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
