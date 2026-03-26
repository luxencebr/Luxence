import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prismaAuth?: PrismaClient };

export const prismaAuth =
  globalForPrisma.prismaAuth ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaAuth = prismaAuth;
}

// Versão edge-compatible - sem process.on() para evitar warnings no Edge Runtime