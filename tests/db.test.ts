import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient, EntryStatus } from "../src/generated/prisma";

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
  await prisma.entryProgress.deleteMany({});
  await prisma.entry.deleteMany({});
});

afterAll(async () => {
  await prisma.entryProgress.deleteMany({});
  await prisma.entry.deleteMany({});
  await prisma.$disconnect();
});

describe("Database sanity checks", () => {
  it("should connect to the database", async () => {
    const result = await prisma.$queryRawUnsafe<{ "?column?": number }[]>(
      "SELECT 1"
    );
    expect(result[0]["?column?"]).toBe(1);
  });

  it("should insert and fetch an Entry", async () => {
    const entry = await prisma.entry.create({
      data: {
        id: "A-MAL-40834",
        title: "Fruits Basket: The Final",
        bestGirl: "Tohru Honda",
        additionalSources: { wiki: "https://fruitsbasket.fandom.com/wiki/Fruits_Basket_Wiki" },
      },
    });

    const found = await prisma.entry.findUnique({
      where: { id: entry.id },
    });

    expect(found?.title).toBe("Fruits Basket: The Final");
    expect(found?.bestGirl).toBe("Tohru Honda");


  });

  it("should insert EntryProgress linked to an Entry", async () => {
    await prisma.entry.create({
      data: {
        id: "A-MAL-38481",
        title: "Jujutsu Kaisen",
      },
    });

    await prisma.entryProgress.create({
      data: {
        id: "A-MAL-38481", // same ID as Entry
        status: EntryStatus.IN_PROGRESS,
        episode: 24,
        length_seconds: 34560,
      },
    });

    const withProgress = await prisma.entry.findUnique({
      where: { id: "A-MAL-38481" },
      include: { progress: true },
    });

    expect(withProgress?.progress?.status).toBe(EntryStatus.IN_PROGRESS);
    expect(withProgress?.progress?.episode).toBe(24);


  });

  it("should update an existing Entry", async () => {
    await prisma.entry.create({
      data: {
        id: "A-MAL-35247",
        title: "Made in Abyss: Retsujitsu no Ougonkyou",
        bestGirl: "Faputa",
      },
    });

    const updated = await prisma.entry.update({
      where: { id: "A-MAL-35247" },
      data: {
        title: "Made in Abyss: The Golden City of the Scorching Sun",
        bestGirl: "Vueko",
      },
    });

    expect(updated.title).toBe("Made in Abyss: The Golden City of the Scorching Sun");
    expect(updated.bestGirl).toBe("Vueko");


  });

  it("should update an existing EntryProgress", async () => {
    await prisma.entry.create({ data: { id: "A-MAL-40356", title: "Horimiya" } });
    await prisma.entryProgress.create({
      data: {
        id: "A-MAL-40356",
        status: EntryStatus.PAUSED,
        episode: 6,
      },
    });

    const updated = await prisma.entryProgress.update({
      where: { id: "A-MAL-40356" },
      data: {
        status: EntryStatus.FINISHED,
        episode: 13,
        length_seconds: 18720,
      },
    });

    expect(updated.status).toBe(EntryStatus.FINISHED);
    expect(updated.episode).toBe(13);
    expect(updated.length_seconds).toBe(18720);


  });

  it("should delete an Entry and its EntryProgress", async () => {
    await prisma.entry.create({ data: { id: "A-MAL-37510", title: "Tensei shitara Slime Datta Ken" } });
    await prisma.entryProgress.create({
      data: { id: "A-MAL-37510", status: EntryStatus.ABANDONED },
    });

    await prisma.entry.delete({ where: { id: "A-MAL-37510" } });

    const foundEntry = await prisma.entry.findUnique({ where: { id: "A-MAL-37510" } });
    const foundProgress = await prisma.entryProgress.findUnique({ where: { id: "A-MAL-37510" } });

    expect(foundEntry).toBeNull();
    expect(foundProgress).toBeNull();
  });

  it("should find entries by bestGirl", async () => {
    await prisma.entry.createMany({
      data: [
        { id: "A-MAL-38000", title: "Kimetsu no Yaiba", bestGirl: "Nezuko Kamado" },
        { id: "A-MAL-40456", title: "Kimetsu no Yaiba: Yuukaku-hen", bestGirl: "Daki" },
        { id: "A-MAL-47778", title: "Kimetsu no Yaiba: Katanakaji no Sato-hen", bestGirl: "Nezuko Kamado" },
      ],
    });

    const found = await prisma.entry.findMany({
      where: { bestGirl: "Nezuko Kamado" },
    });

    expect(found.length).toBe(2);
    expect(found.map((e) => e.title)).toContain("Kimetsu no Yaiba");


  });

  it("should find entries by progress status", async () => {
    await prisma.entry.createMany({
      data: [
        { id: "A-MAL-33486", title: "Boku no Hero Academia 2nd Season" },
        { id: "A-MAL-34599", title: "Made in Abyss" },
        { id: "A-MAL-31964", title: "Boku no Hero Academia" },
      ],
    });
    await prisma.entryProgress.createMany({
      data: [
        { id: "A-MAL-33486", status: EntryStatus.FINISHED },
        { id: "A-MAL-34599", status: EntryStatus.IN_PROGRESS },
        { id: "A-MAL-31964", status: EntryStatus.PAUSED },
      ],
    });

    const inProgress = await prisma.entry.findMany({
      where: { id: "A-MAL-34599", progress: { status: EntryStatus.IN_PROGRESS } },
    });

    expect(inProgress.length).toBe(1);
    expect(inProgress[0].title).toBe("Made in Abyss");


  });

  it("should handle complex additionalSources JSON", async () => {
    const sources = {
      id_MyAnimeList: 30276,
      id_AniList: 21087,
      urls: [
        { name: "Official JP Site", src: "http://onepunchman-anime.net/" },
        { name: "Hulu", src: "https://www.hulu.com/one-punch-man" },
      ],
    };

    await prisma.entry.create({
      data: {
        id: "A-MAL-30276",
        title: "One Punch Man",
        additionalSources: sources,
      },
    });

    const found = await prisma.entry.findUnique({ where: { id: "A-MAL-30276" } });
    expect(found?.additionalSources).toEqual(sources);

    const updatedSources = { ...sources, id_Kitsu: 10999 };
    await prisma.entry.update({
      where: { id: "A-MAL-30276" },
      data: { additionalSources: updatedSources },
    });

    const updated = await prisma.entry.findUnique({ where: { id: "A-MAL-30276" } });
    expect(updated?.additionalSources).toEqual(updatedSources);


  });
});
