import { defineConfig } from 'prisma/config';

// O banco é um arquivo SQLite local (prisma/dev.db), criado pela migração.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  },
});
