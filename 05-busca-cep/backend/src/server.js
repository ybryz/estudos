import { criarApp } from './app.js';

const PORTA = process.env.PORT ?? 3000;

criarApp().listen(PORTA, () => {
  console.log(`Back-end do Busca CEP rodando em http://localhost:${PORTA}`);
});
