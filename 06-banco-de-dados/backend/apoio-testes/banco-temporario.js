// Ajuda dos testes: um banco SQLite novo num arquivo temporário, criado pelas migrações de verdade.
// Fica fora da pasta test/ porque o `node --test` roda como teste tudo que está lá dentro.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { criarPrisma } from '../src/db.js';

export function criarBancoTemporario() {
  const pasta = mkdtempSync(join(tmpdir(), 'busca-cep-'));
  const url = `file:${join(pasta, 'teste.db').replaceAll('\\', '/')}`;
  const prismaCli = createRequire(import.meta.url).resolve('prisma/build/index.js');
  execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'ignore',
  });

  const prisma = criarPrisma(url);
  return {
    prisma,
    async apagar() {
      await prisma.$disconnect();
      rmSync(pasta, { recursive: true, force: true });
    },
  };
}
