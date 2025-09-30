import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

// This path should point to where your actual Prisma client instance is exported.
// Adjust if your prisma.ts file is located elsewhere.
import { prisma } from '@/lib/db';

// Mock the actual prisma module.
// This tells Jest to replace the real 'prisma' module with our mock.
jest.mock('@/lib/db', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

// Before each test, reset the mock to clear any previous mock implementations or call counts.
beforeEach(() => {
  mockReset(prismaMock);
});

// Export the mocked Prisma client for use in your tests.
// We cast it to DeepMockProxy<PrismaClient> to get the full type-safety benefits of jest-mock-extended.
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
