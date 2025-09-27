import { PrismaClient, GlobalContext } from "@/generated/prisma";
import {
  EntryCreateDTO,
  EntryProgressCreateDTO,
  ImpactCreateDTO,
  ImpactContributionCreateDTO,
  RelationCreateDTO,
  RelationContributionCreateDTO,
  RelationReferenceCreateDTO,
  EntryUpdateDTO,
  ImpactUpdateDTO,
  RelationUpdateDTO,
  NRSContextUpdateDTO,
} from "./db_types";

const prisma = new PrismaClient();

export const getEntries = async (page = 1, pageSize = 10) => {
  const skip = (page - 1) * pageSize;
  const entries = await prisma.entry.findMany({
    skip,
    take: pageSize + 1, // Fetch one more to check for next page
    include: { progress: true },
  });

  const hasNextPage = entries.length > pageSize;
  const data = hasNextPage ? entries.slice(0, -1) : entries;

  const hasPreviousPage = page > 1;

  return { entries: data, hasNextPage, hasPreviousPage };
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

// Impact CRUD
export const getImpacts = (page = 1, pageSize = 10) => {
  return prisma.impact.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
};

export const createImpact = (data: ImpactCreateDTO) => {
  return prisma.impact.create({ data });
};

export const getImpact = (id: string) => {
  return prisma.impact.findUnique({ where: { id } });
};

export const updateImpact = (id: string, data: ImpactUpdateDTO) => {
  return prisma.impact.update({
    where: { id },
    data,
  });
};

export const deleteImpact = (id: string) => {
  return prisma.impact.delete({
    where: { id },
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

// Relation CRUD
export const getRelations = (page = 1, pageSize = 10) => {
  return prisma.relation.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
  });
};

export const createRelation = (data: RelationCreateDTO) => {
  return prisma.relation.create({ data });
};

export const getRelation = (id: string) => {
  return prisma.relation.findUnique({ where: { id } });
};

export const updateRelation = (id: string, data: RelationUpdateDTO) => {
  return prisma.relation.update({
    where: { id },
    data,
  });
};

export const deleteRelation = (id: string) => {
  return prisma.relation.delete({
    where: { id },
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

export const updateNRSContext = (data: NRSContextUpdateDTO) => {
  return prisma.nRSContext.update({
    where: { id: GlobalContext.global },
    data,
  });
};