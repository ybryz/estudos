import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client.ts';

// Cria o cliente do Prisma ligado a um arquivo SQLite.
// Os testes passam outro arquivo (ou ':memory:') para não mexer no banco de verdade.
export function criarPrisma(url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db') {
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}
