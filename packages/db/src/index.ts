import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "node:url";
import path from "node:path";

export * from "@prisma/client";

/**
 * Resolve a stable DATABASE_URL. In local dev we default to a SQLite file next
 * to the Prisma schema, using an absolute path so the API, seed script and CLI
 * all hit the same database regardless of the current working directory.
 * In production set DATABASE_URL (PostgreSQL) and it takes precedence.
 */
function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const here = path.dirname(fileURLToPath(import.meta.url));
  const dbFile = path.resolve(here, "../prisma/dev.db");
  return `file:${dbFile}`;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
