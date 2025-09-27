import { PrismaClient } from "@/generated/prisma";

export class TestDB {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async connect() {
    await this.prisma.$connect();
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  async cleanup() {
    // Delete all data from all tables
    await this.prisma.relationContribution.deleteMany({});
    await this.prisma.relationReference.deleteMany({});
    await this.prisma.impactContribution.deleteMany({});
    await this.prisma.relation.deleteMany({});
    await this.prisma.impact.deleteMany({});
    await this.prisma.entryProgress.deleteMany({});
    await this.prisma.entry.deleteMany({});
    await this.prisma.nRSContext.deleteMany({});
  }

  // Getter for the prisma client
  get client() {
    return this.prisma;
  }
}
