import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { criarBancoTemporario } from '../apoio-testes/banco-temporario.js';

const PRACA_DA_SE = {
  cep: '01001000',
  rua: 'Praça da Sé',
  bairro: 'Sé',
  cidade: 'São Paulo',
  estado: 'São Paulo',
};

let banco;
let prisma;

before(() => {
  banco = criarBancoTemporario();
  prisma = banco.prisma;
});

after(() => banco.apagar());

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
