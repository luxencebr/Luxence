import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Só adicionar event listeners se estivermos no Node.js runtime
if (typeof process !== 'undefined' && process.env.NODE_ENV === "production") {
  // Verificar se process.on está disponível (Node.js runtime)
  if (typeof process.on === 'function') {
    process.on("SIGINT", async () => {
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  }
}
