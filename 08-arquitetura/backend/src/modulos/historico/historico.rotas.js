import { Router } from 'express';
import { ultimasBuscas } from './historico.servico.js';

export const rotasHistorico = Router();

rotasHistorico.get('/historico', async (req, res) => {
  res.json(await ultimasBuscas());
});
