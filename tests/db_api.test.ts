import { describe, it, expect } from "@jest/globals";
import { mockDeep } from "jest-mock-extended";
import { DbApi } from "@/lib/db_api";
import {
  PrismaClient,
  GlobalContext,
  EntryStatus,
  NRSContext,
  Entry,
  EntryProgress,
  Impact,
} from "@/generated/prisma";
import {
  EntryCreateDTO,
  EntryProgressCreateDTO,
  ImpactCreateDTO,
  ImpactContributionCreateDTO,
} from "@/lib/db_types";

// Mock the PrismaClient
const prismaMock = mockDeep<PrismaClient>();

describe("DbApi", () => {
  const dbApi = new DbApi(prismaMock as unknown as PrismaClient);

  it("should get NRSContext", async () => {
    const contextData = {
      id: GlobalContext.global,
      factorScoreWeights: { a: 1, b: 2 },
    };
    prismaMock.nRSContext.findUnique.mockResolvedValue(contextData as NRSContext);

    const context = await dbApi.getNRSContext();
    expect(context).toEqual(contextData);
    expect(prismaMock.nRSContext.findUnique).toHaveBeenCalledWith({
      where: { id: GlobalContext.global },
    });
  });

  it("should create an entry with progress", async () => {
    const entryData: EntryCreateDTO = { id: "test-entry-1", title: "Test Entry 1" };
    const progressData: EntryProgressCreateDTO = { status: EntryStatus.IN_PROGRESS };
    const createdEntry = { ...entryData, progress: progressData };
    prismaMock.entry.create.mockResolvedValue(createdEntry as unknown as Entry);

    const entry = await dbApi.createEntryWithProgress(entryData, progressData);
    expect(entry).toEqual(createdEntry);
    expect(prismaMock.entry.create).toHaveBeenCalledWith({
      data: {
        ...entryData,
        progress: {
          create: progressData,
        },
      },
    });
  });

  it("should update entry progress", async () => {
    const progressData = { status: EntryStatus.FINISHED };
    prismaMock.entryProgress.update.mockResolvedValue({
      id: "test-entry-2",
      ...progressData,
    } as EntryProgress);

    await dbApi.updateEntryProgress("test-entry-2", progressData);
    expect(prismaMock.entryProgress.update).toHaveBeenCalledWith({
      where: { id: "test-entry-2" },
      data: progressData,
    });
  });

  it("should add an impact to an entry", async () => {
    const impactData: ImpactCreateDTO = { id: "test-impact-1", name: "Test Impact 1", scoreVector: { a: 1 } };
    const contributionData: ImpactContributionCreateDTO = { contributingWeight: { a: { b: 1 } } };
    const createdImpact = { ...impactData, contributions: [contributionData] };
    prismaMock.impact.create.mockResolvedValue(createdImpact as unknown as Impact);

    await dbApi.addImpactToEntry("test-entry-3", impactData, contributionData);
    expect(prismaMock.impact.create).toHaveBeenCalledWith({
      data: {
        ...impactData,
        contributions: {
          create: {
            entry: { connect: { id: "test-entry-3" } },
            ...contributionData,
          },
        },
      },
    });
  });
});
