import { PrismaClient, GlobalContext } from "../generated/prisma";
import {
  EntryCreateDTO,
  EntryProgressCreateDTO,
  ImpactCreateDTO,
  ImpactContributionCreateDTO,
  RelationCreateDTO,
  RelationContributionCreateDTO,
  RelationReferenceCreateDTO,
  EntryUpdateDTO,
} from "./db_types";

const prisma = new PrismaClient();

export const getEntries = (page = 1, pageSize = 10) => {
  return prisma.entry.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: { progress: true },
  });
};

export const getEntryDetails = (id: string) => {
  return prisma.entry.findUnique({
    where: { id },
    include: {
      progress: true,
      impacts: { include: { impact: true } },
      relations: { include: { relation: true } },
      referencedBy: { include: { relation: true } },
    },
  });
};

export const createEntryWithProgress = (
  entryData: EntryCreateDTO,
  progressData: EntryProgressCreateDTO
) => {
  return prisma.entry.create({
    data: {
      ...entryData,
      progress: {
        create: progressData,
      },
    },
  });
};

export const updateEntry = (id: string, data: EntryUpdateDTO) => {
  return prisma.entry.update({
    where: { id },
    data,
  });
};

export const deleteEntry = (id: string) => {
  return prisma.entry.delete({
    where: { id },
  });
};

export const updateEntryProgress = (
  id: string,
  progressData: Partial<EntryProgressCreateDTO>
) => {
  return prisma.entryProgress.update({
    where: { id },
    data: progressData,
  });
};

export const addImpactToEntry = (
  entryId: string,
  impactData: ImpactCreateDTO,
  contributionData: ImpactContributionCreateDTO
) => {
  return prisma.impact.create({
    data: {
      ...impactData,
      contributions: {
        create: {
          entry: { connect: { id: entryId } },
          ...contributionData,
        },
      },
    },
  });
};

export const addRelationToEntry = (
  entryId: string,
  relationData: RelationCreateDTO,
  contributionData: RelationContributionCreateDTO,
  referenceData: RelationReferenceCreateDTO
) => {
  return prisma.relation.create({
    data: {
      ...relationData,
      contributions: {
        create: {
          entry: { connect: { id: entryId } },
          ...contributionData,
        },
      },
      references: {
        create: {
          entry: { connect: { id: referenceData.entryId } },
          transformMatrix: referenceData.transformMatrix,
        },
      },
    },
  });
};

export const getFullNRSData = () => {
  return prisma.entry.findMany({
    include: {
      impacts: { include: { impact: true } },
      relations: { include: { relation: true } },
      referencedBy: { include: { relation: true } },
    },
  });
};

export const getNRSContext = () => {
  return prisma.nRSContext.findUnique({ where: { id: GlobalContext.global } });
};
