import { criarApp } from './app.js';

// A porta vem do .env (o "npm start" roda o Node com --env-file=.env).
const PORTA = process.env.PORT;
if (!PORTA) {
  console.error('Falta a variável PORT. Copie o .env.example para .env e preencha.');
  process.exit(1);
}

criarApp().listen(PORTA, () => {
  console.log(`Back-end do Busca CEP rodando em http://localhost:${PORTA}`);
});
