import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "@prisma/client";

const { PrismaClient } = pkg;

let currentUrl = null;
let prisma = null;

export const getPrisma = (databaseUrl) => {
  if (!databaseUrl) {
    throw new Error("[Prisma] DATABASE_URL is required");
  }

  if (prisma && currentUrl === databaseUrl) {
    return prisma;
  }

  if (prisma && currentUrl !== databaseUrl) {
    console.warn("[Prisma] Database URL changed, reconnecting...");
    prisma.$disconnect().catch(() => {});
    prisma = null;
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl,
  });

  prisma = new PrismaClient({
    adapter,
    log: [
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
    transactionOptions: {
      timeout: 5000,
      maxWait: 3000,
    },
  });

  currentUrl = databaseUrl;

  return prisma;
};

export const disconnectPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    currentUrl = null;
  }
};
