import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { TestDB } from "./lib/db";
import * as dbApi from "../src/lib/db_api";
import { GlobalContext } from "../src/generated/prisma";

const db = new TestDB();

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.disconnect();
});

beforeEach(async () => {
  await db.cleanup();
});

describe("Database API", () => {
  it("should create and get NRSContext", async () => {
    await db.client.nRSContext.create({
      data: {
        id: GlobalContext.global,
        factorScoreWeights: { a: 1, b: 2 },
      },
    });

    const context = await dbApi.getNRSContext();
    expect(context).toBeDefined();
    expect(context?.factorScoreWeights).toEqual({ a: 1, b: 2 });
  });

  it("should create an entry with progress", async () => {
    const entryData = { id: "test-entry-1", title: "Test Entry 1" };
    const progressData = { status: "IN_PROGRESS" };
    const entry = await dbApi.createEntryWithProgress(entryData, progressData);

    const fetched = await dbApi.getEntryDetails(entry.id);
    expect(fetched?.title).toBe("Test Entry 1");
    expect(fetched?.progress?.status).toBe("IN_PROGRESS");
  });

  it("should update entry progress", async () => {
    const entryData = { id: "test-entry-2", title: "Test Entry 2" };
    const progressData = { status: "IN_PROGRESS" };
    await dbApi.createEntryWithProgress(entryData, progressData);

    await dbApi.updateEntryProgress("test-entry-2", { status: "FINISHED" });

    const fetched = await dbApi.getEntryDetails("test-entry-2");
    expect(fetched?.progress?.status).toBe("FINISHED");
  });

  it("should add an impact to an entry", async () => {
    const entryData = { id: "test-entry-3", title: "Test Entry 3" };
    await db.client.entry.create({ data: entryData });

    const impactData = { id: "test-impact-1", name: "Test Impact 1", scoreVector: { a: 1 } };
    const contributionData = { contributingWeight: { a: 1 } };
    await dbApi.addImpactToEntry("test-entry-3", impactData, contributionData);

    const fetched = await dbApi.getEntryDetails("test-entry-3");
    expect(fetched?.impacts.length).toBe(1);
    expect(fetched?.impacts[0].impact.name).toBe("Test Impact 1");
  });

  it("should get a paginated list of entries", async () => {
    for (let i = 0; i < 15; i++) {
      const entryData = { id: `page-entry-${i}`, title: `Page Entry ${i}` };
      await db.client.entry.create({ data: entryData });
    }

    const page1 = await dbApi.getEntries(1, 10);
    expect(page1.length).toBe(10);

    const page2 = await dbApi.getEntries(2, 10);
    expect(page2.length).toBe(5);
  });
});