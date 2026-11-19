// Servidor de arquivos só para abrir a página no navegador (sem dependências).
// Ele apenas entrega index.html, style.css e app.js; quem busca o CEP é o back-end.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const PASTA = fileURLToPath(new URL('.', import.meta.url));
const PORTA = process.env.PORT ?? 5173;
const ARQUIVOS = {
  '/': 'index.html',
  '/index.html': 'index.html',
  '/style.css': 'style.css',
  '/app.js': 'app.js',
};
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

createServer(async (req, res) => {
  const caminho = new URL(req.url, 'http://localhost').pathname;
  const arquivo = ARQUIVOS[caminho];
  if (!arquivo) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Não encontrado');
  }
  const conteudo = await readFile(join(PASTA, normalize(arquivo)));
  res.writeHead(200, { 'Content-Type': TIPOS[extname(arquivo)] });
  res.end(conteudo);
}).listen(PORTA, () => {
  console.log(`Front-end do Busca CEP em http://localhost:${PORTA}`);
});
