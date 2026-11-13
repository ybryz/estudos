import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarApp, normalizarCep } from '../src/app.js';
import { CepNaoEncontrado, ViaCepIndisponivel } from '../src/viacep.js';

const PRACA_DA_SE = {
  rua: 'Praça da Sé',
  bairro: 'Sé',
  cidade: 'São Paulo',
  estado: 'São Paulo',
};

// Sobe o app numa porta livre, com o ViaCEP trocado por uma função de mentira.
async function comApp(buscarCep, fn) {
  const servidor = criarApp({ buscarCep }).listen(0);
  const { port } = servidor.address();
  try {
    await fn((caminho) => fetch(`http://localhost:${port}${caminho}`));
  } finally {
    servidor.close();
  }
}

test('normalizarCep aceita 8 números, com ou sem hífen', () => {
  assert.equal(normalizarCep('01001000'), '01001000');
  assert.equal(normalizarCep('01001-000'), '01001000');
  assert.equal(normalizarCep(' 01001-000 '), '01001000');
});

test('normalizarCep recusa o que não é CEP', () => {
  for (const ruim of ['123', 'abcdefgh', '0100-1000', '010010000', '', '01001-0000']) {
    assert.equal(normalizarCep(ruim), null, ruim);
  }
});

test('200: devolve só rua, bairro, cidade e estado', async () => {
  await comApp(async () => PRACA_DA_SE, async (get) => {
    const r = await get('/cep/01001-000');
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), PRACA_DA_SE);
  });
});

test('CORS: respostas liberam a origem do front-end', async () => {
  await comApp(async () => PRACA_DA_SE, async (get) => {
    for (const caminho of ['/cep/01001000', '/cep/123']) {
      const r = await get(caminho);
      assert.equal(r.headers.get('access-control-allow-origin'), '*', caminho);
    }
  });
});

test('400: CEP inválido nem chega no ViaCEP', async () => {
  let chamou = false;
  await comApp(async () => { chamou = true; }, async (get) => {
    const r = await get('/cep/123');
    assert.equal(r.status, 400);
    assert.match((await r.json()).erro, /CEP inválido/);
  });
  assert.equal(chamou, false);
});

test('404: CEP que não existe', async () => {
  await comApp(async () => { throw new CepNaoEncontrado(); }, async (get) => {
    const r = await get('/cep/99999999');
    assert.equal(r.status, 404);
    assert.equal((await r.json()).erro, 'CEP não encontrado.');
  });
});

test('502: ViaCEP fora do ar', async () => {
  await comApp(async () => { throw new ViaCepIndisponivel(); }, async (get) => {
    const r = await get('/cep/01001000');
    assert.equal(r.status, 502);
    assert.match((await r.json()).erro, /ViaCEP/);
  });
});

test('404: rota que não existe', async () => {
  await comApp(async () => PRACA_DA_SE, async (get) => {
    const r = await get('/outra-coisa');
    assert.equal(r.status, 404);
  });
});
