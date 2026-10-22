import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { criarApp } from '../src/app.js';
import { CepNaoEncontrado, ViaCepIndisponivel } from '../src/viacep.js';
import { criarBancoTemporario } from '../apoio-testes/banco-temporario.js';

const PRACA_DA_SE = {
  rua: 'Praça da Sé',
  bairro: 'Sé',
  cidade: 'São Paulo',
  estado: 'São Paulo',
};

let banco;
before(() => { banco = criarBancoTemporario(); });
after(() => banco.apagar());

// Cada teste começa com as tabelas vazias.
beforeEach(async () => {
  await banco.prisma.busca.deleteMany();
  await banco.prisma.endereco.deleteMany();
});

async function comApp(buscarCep, fn, prisma = banco.prisma) {
  const servidor = criarApp({ prisma, buscarCep }).listen(0);
  const { port } = servidor.address();
  try {
    await fn((caminho) => fetch(`http://localhost:${port}${caminho}`));
  } finally {
    servidor.close();
  }
}

test('GET /historico com o banco vazio devolve lista vazia', async () => {
  await comApp(async () => PRACA_DA_SE, async (get) => {
    const r = await get('/historico');
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), []);
  });
});

test('busca que deu certo entra no histórico com o endereço', async () => {
  await comApp(async () => PRACA_DA_SE, async (get) => {
    await get('/cep/01001-000');

    const [busca, ...resto] = await (await get('/historico')).json();
    assert.equal(resto.length, 0);
    assert.equal(busca.cep, '01001000');
    assert.equal(busca.deuCerto, true);
    assert.deepEqual(busca.endereco, PRACA_DA_SE);
    assert.ok(!Number.isNaN(Date.parse(busca.criadaEm)));
  });
});

test('o mesmo CEP buscado duas vezes: 2 buscas, 1 endereço', async () => {
  await comApp(async () => PRACA_DA_SE, async (get) => {
    await get('/cep/01001000');
    await get('/cep/01001-000');

    assert.equal((await (await get('/historico')).json()).length, 2);
    assert.equal(await banco.prisma.endereco.count(), 1);
    assert.equal(await banco.prisma.busca.count(), 2);
  });
});

test('CEP que não existe entra no histórico como falha, sem endereço', async () => {
  await comApp(async () => { throw new CepNaoEncontrado(); }, async (get) => {
    assert.equal((await get('/cep/99999999')).status, 404);

    const [busca] = await (await get('/historico')).json();
    assert.equal(busca.cep, '99999999');
    assert.equal(busca.deuCerto, false);
    assert.equal(busca.endereco, null);
    assert.equal(await banco.prisma.endereco.count(), 0);
  });
});

test('ViaCEP fora do ar também entra como falha', async () => {
  await comApp(async () => { throw new ViaCepIndisponivel(); }, async (get) => {
    assert.equal((await get('/cep/01001000')).status, 502);

    const [busca] = await (await get('/historico')).json();
    assert.equal(busca.deuCerto, false);
  });
});

test('CEP mal formado (400) não entra no histórico', async () => {
  await comApp(async () => PRACA_DA_SE, async (get) => {
    assert.equal((await get('/cep/123')).status, 400);
    assert.deepEqual(await (await get('/historico')).json(), []);
  });
});

test('o histórico mostra só as 10 últimas, da mais nova para a mais antiga', async () => {
  const ceps = Array.from({ length: 12 }, (_, i) => String(10000000 + i));
  await comApp(async () => PRACA_DA_SE, async (get) => {
    for (const cep of ceps) {
      await get(`/cep/${cep}`);
    }

    const historico = await (await get('/historico')).json();
    assert.equal(historico.length, 10);
    assert.deepEqual(historico.map((b) => b.cep), ceps.slice(2).reverse());
  });
  assert.equal(await banco.prisma.busca.count(), 12);
});

test('se o banco falhar, a busca ainda responde 200', async () => {
  const prismaQuebrado = {
    endereco: { upsert: async () => { throw new Error('banco fora do ar'); } },
    busca: { create: async () => { throw new Error('banco fora do ar'); } },
  };
  const erro = console.error;
  console.error = () => {};
  try {
    await comApp(async () => PRACA_DA_SE, async (get) => {
      const r = await get('/cep/01001000');
      assert.equal(r.status, 200);
      assert.deepEqual(await r.json(), PRACA_DA_SE);
    }, prismaQuebrado);
  } finally {
    console.error = erro;
  }
});
