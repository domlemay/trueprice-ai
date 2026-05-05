import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Re-export all Prisma types
export * from "@prisma/client";

// Query helpers
export * from "./queries/users";
export * from "./queries/organizations";
export * from "./queries/subscriptions";
export * from "./queries/searches";
export * from "./queries/favorites";
export * from "./queries/alerts";
export * from "./queries/notifications";
export * from "./queries/addresses";
