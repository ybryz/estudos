import { Router } from 'express';
import { limparCep, buscarEndereco } from './cep.servico.js';

export const rotasCep = Router();

rotasCep.get('/cep/:cep', async (req, res) => {
  const cep = limparCep(req.params.cep);
  if (!cep) {
    return res.status(400).json({ erro: 'CEP inválido. Digite 8 números.' });
  }

  const resultado = await buscarEndereco(cep);
  if (!resultado) {
    return res.status(404).json({ erro: 'CEP não encontrado.' });
  }
  res.json(resultado);
});
