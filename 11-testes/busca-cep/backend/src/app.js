import express from 'express';
import { buscarNoViaCep, CepNaoEncontrado, ViaCepIndisponivel } from './viacep.js';

// Aceita "01001000" ou "01001-000" e devolve só os 8 números, ou null se o CEP for inválido.
export function normalizarCep(texto) {
  const cep = String(texto).trim().replace(/^(\d{5})-(\d{3})$/, '$1$2');
  return /^\d{8}$/.test(cep) ? cep : null;
}

export function criarApp({ buscarCep = buscarNoViaCep } = {}) {
  const app = express();

  // CORS: o front roda em outra porta (localhost:5173) e o navegador só deixa a página
  // ler a resposta deste back-end (localhost:3000) se ele avisar que permite.
  // Os dados são públicos e não há login, então liberar qualquer origem é seguro aqui.
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*');
    next();
  });

  // GET /cep/:cep -> { rua, bairro, cidade, estado }
  app.get('/cep/:cep', async (req, res) => {
    const cep = normalizarCep(req.params.cep);
    if (!cep) {
      return res.status(400).json({
        erro: 'CEP inválido. Informe 8 números, com ou sem hífen (ex.: 01001-000).',
      });
    }

    try {
      const endereco = await buscarCep(cep);
      return res.status(200).json(endereco);
    } catch (erro) {
      if (erro instanceof CepNaoEncontrado) {
        return res.status(404).json({ erro: 'CEP não encontrado.' });
      }
      if (erro instanceof ViaCepIndisponivel) {
        return res.status(502).json({
          erro: 'Não foi possível consultar o ViaCEP agora. Tente de novo em instantes.',
        });
      }
      return res.status(500).json({ erro: 'Erro inesperado no servidor.' });
    }
  });

  // Qualquer outra rota.
  app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada. Use GET /cep/:cep.' });
  });

  return app;
}
