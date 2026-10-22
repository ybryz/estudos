import { criarApp } from './app.js';
import { criarPrisma } from './db.js';

const PORTA = process.env.PORT ?? 3000;

criarApp({ prisma: criarPrisma() }).listen(PORTA, () => {
  console.log(`Back-end do Busca CEP rodando em http://localhost:${PORTA}`);
});
