-- CreateEnum
CREATE TYPE "public"."GlobalContext" AS ENUM ('global');

-- CreateEnum
CREATE TYPE "public"."EntryType" AS ENUM ('Anime', 'Manga', 'LightNovel', 'VisualNovel', 'MusicAlbum', 'MusicArtist', 'MusicTrack', 'Franchise', 'Game', 'Other');

-- CreateEnum
CREATE TYPE "public"."EntryStatus" AS ENUM ('FINISHED', 'IN_PROGRESS', 'ABANDONED', 'PAUSED', 'NOT_STARTED');

-- CreateEnum
CREATE TYPE "public"."VisualType" AS ENUM ('animated', 'rpg3dGame', 'animatedShort', 'animatedMV', 'visualNovel', 'manga', 'animatedGachaCardArt', 'gachaCardArt', 'lightNovel', 'semiAnimatedMV', 'staticMV', 'albumArt');

-- CreateTable
CREATE TABLE "public"."NRSContext" (
    "id" "public"."GlobalContext" NOT NULL DEFAULT 'global',
    "factorScoreWeights" JSONB NOT NULL,

    CONSTRAINT "NRSContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Entry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "entryType" "public"."EntryType" NOT NULL,
    "bestGirl" TEXT,
    "additionalSources" JSONB,
    "dah_meta" JSONB,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntryProgress" (
    "id" TEXT NOT NULL,
    "status" "public"."EntryStatus" NOT NULL,
    "length_seconds" INTEGER,
    "episode" INTEGER,

    CONSTRAINT "EntryProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Impact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scoreVector" JSONB NOT NULL,
    "dah_meta" JSONB,

    CONSTRAINT "Impact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImpactContribution" (
    "impactId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "contributingWeight" JSONB NOT NULL,

    CONSTRAINT "ImpactContribution_pkey" PRIMARY KEY ("impactId","entryId")
);

-- CreateTable
CREATE TABLE "public"."Relation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dah_meta" JSONB,

    CONSTRAINT "Relation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RelationReference" (
    "relationId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "transformMatrix" JSONB NOT NULL,

    CONSTRAINT "RelationReference_pkey" PRIMARY KEY ("relationId","entryId")
);

-- CreateTable
CREATE TABLE "public"."RelationContribution" (
    "relationId" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "contributingWeight" JSONB NOT NULL,

    CONSTRAINT "RelationContribution_pkey" PRIMARY KEY ("relationId","entryId")
);

-- AddForeignKey
ALTER TABLE "public"."EntryProgress" ADD CONSTRAINT "EntryProgress_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactContribution" ADD CONSTRAINT "ImpactContribution_impactId_fkey" FOREIGN KEY ("impactId") REFERENCES "public"."Impact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImpactContribution" ADD CONSTRAINT "ImpactContribution_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RelationReference" ADD CONSTRAINT "RelationReference_relationId_fkey" FOREIGN KEY ("relationId") REFERENCES "public"."Relation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RelationReference" ADD CONSTRAINT "RelationReference_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RelationContribution" ADD CONSTRAINT "RelationContribution_relationId_fkey" FOREIGN KEY ("relationId") REFERENCES "public"."Relation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RelationContribution" ADD CONSTRAINT "RelationContribution_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "public"."Entry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
