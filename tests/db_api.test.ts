import { createEntry } from "@/lib/db_api";
import { prismaMock } from "./setup/prisma-mock";

describe("createEntry", () => {
  it("should create an entry with the given id and title", async () => {
    const newEntry = {
      id: "test-id",
      title: "Test Title",
      bestGirl: null,
      progress: null,
      additionalSources: null,
      dah_meta: null,
      impacts: [],
      relations: [],
      referencedBy: [],
    };

    prismaMock.entry.create.mockResolvedValue(newEntry);

    const result = await createEntry({ id: "test-id", title: "Test Title" });

    expect(prismaMock.entry.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.entry.create).toHaveBeenCalledWith({
      data: {
        id: "test-id",
        title: "Test Title",
      },
    });
    expect(result).toEqual(newEntry);
  });
});