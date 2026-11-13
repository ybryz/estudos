import { createClient } from 'redis';

// o Redis do Docker (docker compose up -d): porta 6380 no PC
const redis = createClient({
  url: 'redis://localhost:6380',
  socket: { reconnectStrategy: false },
});
redis.on('error', () => {});

// se o Redis não estiver ligado, o Busca CEP continua funcionando, só que sem cache
let ligado = false;
try {
  await redis.connect();
  ligado = true;
} catch {
  console.log('Redis desligado: as buscas vão direto ao ViaCEP, sem cache.');
}

const UMA_HORA = 3600;

export async function lerEndereco(cep) {
  if (!ligado) return null;
  return JSON.parse((await redis.get(`cep:${cep}`)) ?? 'null');
}

export async function guardarEndereco(cep, endereco) {
  if (!ligado) return;
  await redis.set(`cep:${cep}`, JSON.stringify(endereco), {
    expiration: { type: 'EX', value: UMA_HORA },
  });
}

// conta quantas vezes esse CEP foi buscado (INCR cria a chave com 1 e soma 1 a cada vez)
export async function contarBusca(cep) {
  if (!ligado) return null;
  return redis.incr(`contador:${cep}`);
}
