import express from 'express';
import { rotasCep } from './modulos/cep/index.js';
import { rotasHistorico } from './modulos/historico/index.js';

// o server.js só monta o app e liga as rotas de cada módulo
const app = express();

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

app.use(rotasCep);
app.use(rotasHistorico);

app.listen(3000, () => console.log('Back-end em http://localhost:3000'));
