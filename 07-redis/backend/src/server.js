import express from 'express';
import { createClient } from 'redis';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client.ts';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' }),
});

// o Redis do Docker (docker compose up -d): porta 6380 no PC
const redis = createClient({ url: 'redis://localhost:6380' });
redis.on('error', (erro) => console.log('Redis:', erro.message));
await redis.connect();

const app = express();

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/cep/:cep', async (req, res) => {
  const cep = req.params.cep.replace('-', '');
  if (!/^\d{8}$/.test(cep)) {
    return res.status(400).json({ erro: 'CEP inválido. Digite 8 números.' });
  }

  // conta quantas vezes esse CEP foi buscado (INCR cria a chave com 1 e soma 1 a cada vez)
  const buscas = await redis.incr(`contador:${cep}`);

  // 1º olha no cache; se não achar, vai ao ViaCEP
  let endereco = JSON.parse((await redis.get(`cep:${cep}`)) ?? 'null');
  const origem = endereco ? 'cache' : 'viacep';
  console.log(`CEP ${cep}: veio ${endereco ? 'do cache' : 'do ViaCEP'}`);

  if (!endereco) {
    let dados;
    try {
      dados = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
    } catch {
      dados = { erro: true };
    }

    if (dados.erro) {
      await prisma.busca.create({ data: { cep, deuCerto: false } });
      return res.status(404).json({ erro: 'CEP não encontrado.' });
    }

    endereco = {
      rua: dados.logradouro,
      bairro: dados.bairro,
      cidade: dados.localidade,
      estado: dados.estado,
    };
    // guarda no cache por 1 hora (3600 segundos); depois o Redis apaga sozinho
    await redis.set(`cep:${cep}`, JSON.stringify(endereco), {
      expiration: { type: 'EX', value: 3600 },
    });
  }

  // histórico (banco do 06): o endereço fica uma vez só por CEP e a busca aponta para ele
  const salvo = await prisma.endereco.upsert({
    where: { cep },
    create: { cep, ...endereco },
    update: endereco,
  });
  await prisma.busca.create({ data: { cep, deuCerto: true, enderecoId: salvo.id } });

  res.json({ ...endereco, origem, buscas });
});

app.get('/historico', async (req, res) => {
  res.json(
    await prisma.busca.findMany({
      orderBy: [{ criadaEm: 'desc' }, { id: 'desc' }],
      take: 10,
      include: { endereco: true },
    }),
  );
});

app.listen(3000, () => console.log('Back-end em http://localhost:3000'));
