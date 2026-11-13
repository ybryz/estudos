import { prisma } from './prisma.js';

// guarda a busca; se deu certo, o endereço fica uma vez só por CEP e a busca aponta para ele
export async function registrarBusca(cep, endereco) {
  if (!endereco) {
    await prisma.busca.create({ data: { cep, deuCerto: false } });
    return;
  }
  const salvo = await prisma.endereco.upsert({
    where: { cep },
    create: { cep, ...endereco },
    update: endereco,
  });
  await prisma.busca.create({ data: { cep, deuCerto: true, enderecoId: salvo.id } });
}

export function ultimasBuscas() {
  return prisma.busca.findMany({
    orderBy: [{ criadaEm: 'desc' }, { id: 'desc' }],
    take: 10,
    include: { endereco: true },
  });
}
