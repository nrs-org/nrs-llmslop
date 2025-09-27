import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { TestDB } from "./lib/db";
import { EntryStatus, GlobalContext } from "../src/generated/prisma";

const db = new TestDB();

beforeAll(async () => {
  await db.connect();
  await db.cleanup();
});

afterAll(async () => {
  await db.cleanup();
  await db.disconnect();
});

describe("Database Models", () => {
  it("should connect to the database", async () => {
    const result = await db.client.$queryRawUnsafe<{ "?column?": number }[]>(
      "SELECT 1"
    );
    expect(result[0]["?column?"]).toBe(1);
  });

  it("should create and get NRSContext", async () => {
    await db.client.nRSContext.create({
      data: {
        id: GlobalContext.global,
        factorScoreWeights: { a: 1, b: 2 },
      },
    });

    const context = await db.client.nRSContext.findUnique({
      where: { id: GlobalContext.global },
    });

    expect(context).toBeDefined();
    expect(context?.factorScoreWeights).toEqual({ a: 1, b: 2 });
  });

  it("should create an Entry", async () => {
    const entry = await db.client.entry.create({
      data: {
        id: "test-entry",
        title: "Test Entry",
      },
    });

    expect(entry.id).toBe("test-entry");
    expect(entry.title).toBe("Test Entry");
  });

  it("should create an Impact", async () => {
    const impact = await db.client.impact.create({
      data: {
        id: "test-impact",
        name: "Test Impact",
        scoreVector: { a: 1 },
      },
    });

    expect(impact.id).toBe("test-impact");
    expect(impact.name).toBe("Test Impact");
  });

  it("should create a Relation", async () => {
    const relation = await db.client.relation.create({
      data: {
        id: "test-relation",
        name: "Test Relation",
      },
    });

    expect(relation.id).toBe("test-relation");
    expect(relation.name).toBe("Test Relation");
  });

  it("should create an ImpactContribution", async () => {
    await db.client.entry.create({
      data: {
        id: "entry-for-impact",
        title: "Entry for Impact",
      },
    });

    await db.client.impact.create({
      data: {
        id: "impact-for-contribution",
        name: "Impact for Contribution",
        scoreVector: { a: 1 },
      },
    });

    const contribution = await db.client.impactContribution.create({
      data: {
        impactId: "impact-for-contribution",
        entryId: "entry-for-impact",
        contributingWeight: { a: 1 },
      },
    });

    expect(contribution.impactId).toBe("impact-for-contribution");
    expect(contribution.entryId).toBe("entry-for-impact");
  });

  it("should create a RelationReference", async () => {
    await db.client.entry.create({
      data: {
        id: "entry-for-reference",
        title: "Entry for Reference",
      },
    });

    await db.client.relation.create({
      data: {
        id: "relation-for-reference",
        name: "Relation for Reference",
      },
    });

    const reference = await db.client.relationReference.create({
      data: {
        relationId: "relation-for-reference",
        entryId: "entry-for-reference",
        transformMatrix: { a: 1 },
      },
    });

    expect(reference.relationId).toBe("relation-for-reference");
    expect(reference.entryId).toBe("entry-for-reference");
  });

  it("should create a RelationContribution", async () => {
    await db.client.entry.create({
      data: {
        id: "entry-for-relation-contribution",
        title: "Entry for Relation Contribution",
      },
    });

    await db.client.relation.create({
      data: {
        id: "relation-for-contribution",
        name: "Relation for Contribution",
      },
    });

    const contribution = await db.client.relationContribution.create({
      data: {
        relationId: "relation-for-contribution",
        entryId: "entry-for-relation-contribution",
        contributingWeight: { a: 1 },
      },
    });

    expect(contribution.relationId).toBe("relation-for-contribution");
    expect(contribution.entryId).toBe("entry-for-relation-contribution");
  });
});