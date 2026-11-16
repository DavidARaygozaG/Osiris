import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

/**
 * Local dev  → DATABASE_URL=file:./prisma/dev.db  → PrismaClient normal (SQLite)
 * Producción → TURSO_DATABASE_URL + TURSO_AUTH_TOKEN → PrismaLibSql (Turso)
 */
function createPrismaClient() {
  if (process.env.TURSO_DATABASE_URL) {
    const adapter = new PrismaLibSql({
      url:       process.env.TURSO_DATABASE_URL.trim(),
      authToken: (process.env.TURSO_AUTH_TOKEN ?? '').trim(),
    });
    return new PrismaClient({ adapter });
  }

  // Local: usa DATABASE_URL=file:./prisma/dev.db del .env.local
  return new PrismaClient();
}

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
