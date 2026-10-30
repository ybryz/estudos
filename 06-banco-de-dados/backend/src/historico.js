// Lê e grava o histórico de buscas no banco.

export const LIMITE_HISTORICO = 10;

// Guarda uma busca. Se deu certo (veio um endereço), grava o endereço uma única vez por CEP
// (upsert: cria se não existe, atualiza se já existe) e liga a busca a ele.
export async function registrarBusca(prisma, cep, endereco) {
  if (!endereco) {
    return prisma.busca.create({ data: { cep, deuCerto: false } });
  }

  const salvo = await prisma.endereco.upsert({
    where: { cep },
    create: { cep, ...endereco },
    update: endereco,
  });
  return prisma.busca.create({ data: { cep, deuCerto: true, enderecoId: salvo.id } });
}

// As últimas buscas, da mais nova para a mais antiga (o id desempata buscas no mesmo instante).
export async function ultimasBuscas(prisma, limite = LIMITE_HISTORICO) {
  const buscas = await prisma.busca.findMany({
    orderBy: [{ criadaEm: 'desc' }, { id: 'desc' }],
    take: limite,
    include: { endereco: true },
  });

  return buscas.map((busca) => ({
    id: busca.id,
    cep: busca.cep,
    criadaEm: busca.criadaEm.toISOString(),
    deuCerto: busca.deuCerto,
    endereco: busca.endereco && {
      rua: busca.endereco.rua,
      bairro: busca.endereco.bairro,
      cidade: busca.endereco.cidade,
      estado: busca.endereco.estado,
    },
  }));
}
