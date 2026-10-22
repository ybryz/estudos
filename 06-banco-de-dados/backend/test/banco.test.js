import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { criarPrisma } from '../src/db.js';

const PRACA_DA_SE = {
  cep: '01001000',
  rua: 'Praça da Sé',
  bairro: 'Sé',
  cidade: 'São Paulo',
  estado: 'São Paulo',
};

let pasta;
let prisma;

// Cada execução usa um banco novo num arquivo temporário, criado pelas migrações de verdade.
before(() => {
  pasta = mkdtempSync(join(tmpdir(), 'busca-cep-'));
  const url = `file:${join(pasta, 'teste.db').replaceAll('\\', '/')}`;
  const prismaCli = createRequire(import.meta.url).resolve('prisma/build/index.js');
  execFileSync(process.execPath, [prismaCli, 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'ignore',
  });
  prisma = criarPrisma(url);
});

after(async () => {
  await prisma.$disconnect();
  rmSync(pasta, { recursive: true, force: true });
});

test('uma busca que deu certo aponta para o endereço', async () => {
  const endereco = await prisma.endereco.create({ data: PRACA_DA_SE });
  const busca = await prisma.busca.create({
    data: { cep: '01001000', deuCerto: true, enderecoId: endereco.id },
    include: { endereco: true },
  });

  assert.equal(busca.endereco.rua, 'Praça da Sé');
  assert.ok(busca.criadaEm instanceof Date);

  const doEndereco = await prisma.endereco.findUnique({
    where: { cep: '01001000' },
    include: { buscas: true },
  });
  assert.equal(doEndereco.buscas.length, 1);
});

test('uma busca que falhou fica sem endereço', async () => {
  const busca = await prisma.busca.create({
    data: { cep: '99999999', deuCerto: false },
    include: { endereco: true },
  });
  assert.equal(busca.deuCerto, false);
  assert.equal(busca.endereco, null);
});

test('o mesmo CEP não vira dois endereços', async () => {
  await assert.rejects(prisma.endereco.create({ data: PRACA_DA_SE }), { code: 'P2002' });
  assert.equal(await prisma.endereco.count({ where: { cep: '01001000' } }), 1);
});

test('várias buscas do mesmo CEP dividem o mesmo endereço', async () => {
  const endereco = await prisma.endereco.findUnique({ where: { cep: '01001000' } });
  await prisma.busca.create({ data: { cep: '01001000', deuCerto: true, enderecoId: endereco.id } });

  const buscas = await prisma.busca.findMany({ where: { enderecoId: endereco.id } });
  assert.equal(buscas.length, 2);
});

test('a chave estrangeira recusa um endereço que não existe', async () => {
  await assert.rejects(
    prisma.busca.create({ data: { cep: '01001000', deuCerto: true, enderecoId: 9999 } }),
    { code: 'P2003' },
  );
});
