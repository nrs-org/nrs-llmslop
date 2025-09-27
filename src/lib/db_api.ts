import { PrismaClient, GlobalContext } from "../generated/prisma";

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

export const createEntryWithProgress = (entryData: any, progressData: any) => {
  const { id, ...restOfProgressData } = progressData;
  return prisma.entry.create({
    data: {
      ...entryData,
      progress: {
        create: restOfProgressData,
      },
    },
  });
};

export const updateEntryProgress = (id: string, progressData: any) => {
  return prisma.entryProgress.update({
    where: { id },
    data: progressData,
  });
};

export const addImpactToEntry = (entryId: string, impactData: any, contributionData: any) => {
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
  relationData: any,
  contributionData: any,
  referenceData: any
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
          ...referenceData,
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
