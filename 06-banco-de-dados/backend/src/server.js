import express from 'express';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from './generated/prisma/client.ts';

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' }),
});

const app = express();

// deixa a página (que roda em outro endereço) ler as respostas
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/cep/:cep', async (req, res) => {
  const cep = req.params.cep.replace('-', '');
  if (!/^\d{8}$/.test(cep)) {
    return res.status(400).json({ erro: 'CEP inválido. Digite 8 números.' });
  }

  let dados;
  try {
    dados = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
  } catch {
    dados = { erro: true };
  }

  // não achou: guarda a busca sem endereço
  if (dados.erro) {
    await prisma.busca.create({ data: { cep, deuCerto: false } });
    return res.status(404).json({ erro: 'CEP não encontrado.' });
  }

  // achou: o endereço é guardado uma vez só por CEP (upsert) e a busca aponta para ele
  const endereco = {
    rua: dados.logradouro,
    bairro: dados.bairro,
    cidade: dados.localidade,
    estado: dados.estado,
  };
  const salvo = await prisma.endereco.upsert({
    where: { cep },
    create: { cep, ...endereco },
    update: endereco,
  });
  await prisma.busca.create({ data: { cep, deuCerto: true, enderecoId: salvo.id } });

  res.json(endereco);
});

// as 10 últimas buscas, da mais nova para a mais antiga
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
