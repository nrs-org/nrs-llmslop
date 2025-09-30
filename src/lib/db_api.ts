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
import { DeepMockProxy } from "jest-mock-extended";

export class DbApi {
  private prisma: PrismaClient | DeepMockProxy<PrismaClient>;

  constructor(prismaClient: PrismaClient | DeepMockProxy<PrismaClient>) {
    this.prisma = prismaClient;
  }

  getEntries = async (page = 1, pageSize = 10) => {
    const skip = (page - 1) * pageSize;
    const entries = await this.prisma.entry.findMany({
      skip,
      take: pageSize + 1, // Fetch one more to check for next page
      include: { progress: true },
    });

    const hasNextPage = entries.length > pageSize;
    const data = hasNextPage ? entries.slice(0, -1) : entries;

    const hasPreviousPage = page > 1;

    return { entries: data, hasNextPage, hasPreviousPage };
  };

  getEntryDetails = (id: string) => {
    return this.prisma.entry.findUnique({
      where: { id },
      include: {
        progress: true,
        impacts: { include: { impact: true } },
        relations: { include: { relation: true } },
        referencedBy: { include: { relation: true } },
      },
    });
  };

  createEntryWithProgress = (
    entryData: EntryCreateDTO,
    progressData: EntryProgressCreateDTO
  ) => {
    return this.prisma.entry.create({
      data: {
        ...entryData,
        progress: {
          create: progressData,
        },
      },
    });
  };

  updateEntry = (id: string, data: EntryUpdateDTO) => {
    return this.prisma.entry.update({
      where: { id },
      data,
    });
  };

  deleteEntry = (id: string) => {
    return this.prisma.entry.delete({
      where: { id },
    });
  };

  updateEntryProgress = (
    id: string,
    progressData: Partial<EntryProgressCreateDTO>
  ) => {
    return this.prisma.entryProgress.update({
      where: { id },
      data: progressData,
    });
  };

  // Impact CRUD
  getImpacts = (page = 1, pageSize = 10) => {
    return this.prisma.impact.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  };

  createImpact = (data: ImpactCreateDTO) => {
    return this.prisma.impact.create({ data });
  };

  getImpact = (id: string) => {
    return this.prisma.impact.findUnique({ where: { id } });
  };

  updateImpact = (id: string, data: ImpactUpdateDTO) => {
    return this.prisma.impact.update({
      where: { id },
      data,
    });
  };

  deleteImpact = (id: string) => {
    return this.prisma.impact.delete({
      where: { id },
    });
  };

  addImpactToEntry = (
    entryId: string,
    impactData: ImpactCreateDTO,
    contributionData: ImpactContributionCreateDTO
  ) => {
    return this.prisma.impact.create({
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
  getRelations = (page = 1, pageSize = 10) => {
    return this.prisma.relation.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  };

  createRelation = (data: RelationCreateDTO) => {
    return this.prisma.relation.create({ data });
  };

  getRelation = (id: string) => {
    return this.prisma.relation.findUnique({ where: { id } });
  };

  updateRelation = (id: string, data: RelationUpdateDTO) => {
    return this.prisma.relation.update({
      where: { id },
      data,
    });
  };

  deleteRelation = (id: string) => {
    return this.prisma.relation.delete({
      where: { id },
    });
  };

  addRelationToEntry = (
    entryId: string,
    relationData: RelationCreateDTO,
    contributionData: RelationContributionCreateDTO,
    referenceData: RelationReferenceCreateDTO
  ) => {
    return this.prisma.relation.create({
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

  getFullNRSData = () => {
    return this.prisma.entry.findMany({
      include: {
        impacts: { include: { impact: true } },
        relations: { include: { relation: true } },
        referencedBy: { include: { relation: true } },
      },
    });
  };

  getNRSContext = () => {
    return this.prisma.nRSContext.findUnique({ where: { id: GlobalContext.global } });
  };

  updateNRSContext = (data: NRSContextUpdateDTO) => {
    return this.prisma.nRSContext.update({
      where: { id: GlobalContext.global },
      data,
    });
  };
}

export const dbApi = new DbApi(new PrismaClient());
