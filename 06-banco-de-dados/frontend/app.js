// Endereço do SEU back-end. O front nunca chama o ViaCEP direto.
const URL_BACKEND = 'http://localhost:3000';

const formulario = document.getElementById('formulario');
const campoCep = document.getElementById('cep');
const botao = document.getElementById('botao');
const resultado = document.getElementById('resultado');
const listaHistorico = document.getElementById('historico');

function mostrarErro(mensagem) {
  resultado.replaceChildren();
  const caixa = document.createElement('div');
  caixa.className = 'erro';
  caixa.setAttribute('role', 'alert');
  caixa.textContent = mensagem;
  resultado.append(caixa);
}

function mostrarEndereco(endereco) {
  resultado.replaceChildren();
  const caixa = document.createElement('dl');
  caixa.className = 'endereco';
  const campos = [
    ['Rua', endereco.rua],
    ['Bairro', endereco.bairro],
    ['Cidade', endereco.cidade],
    ['Estado', endereco.estado],
  ];
  for (const [nome, valor] of campos) {
    const rotulo = document.createElement('dt');
    rotulo.textContent = nome;
    const conteudo = document.createElement('dd');
    // Alguns CEPs (de cidade pequena) não têm rua nem bairro.
    conteudo.textContent = valor || '—';
    caixa.append(rotulo, conteudo);
  }
  resultado.append(caixa);
}

// "01001000" -> "01001-000"
function formatarCep(cep) {
  return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

function criarItemDoHistorico(busca) {
  const item = document.createElement('li');
  item.className = busca.deuCerto ? 'busca certo' : 'busca erro-busca';

  const topo = document.createElement('div');
  topo.className = 'busca-topo';
  const cep = document.createElement('strong');
  cep.textContent = formatarCep(busca.cep);
  const situacao = document.createElement('span');
  situacao.className = 'situacao';
  situacao.textContent = busca.deuCerto ? 'Deu certo' : 'Não deu certo';
  topo.append(cep, situacao);

  const detalhe = document.createElement('div');
  detalhe.className = 'busca-detalhe';
  const quando = new Date(busca.criadaEm).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  const local = busca.endereco
    ? [busca.endereco.rua, busca.endereco.cidade].filter(Boolean).join(', ')
    : '';
  detalhe.textContent = local ? `${quando} · ${local}` : quando;

  item.append(topo, detalhe);
  return item;
}

function mostrarHistorico(buscas) {
  if (buscas.length === 0) {
    const vazio = document.createElement('li');
    vazio.className = 'historico-vazio';
    vazio.textContent = 'Nenhuma busca ainda.';
    listaHistorico.replaceChildren(vazio);
    return;
  }
  listaHistorico.replaceChildren(...buscas.map(criarItemDoHistorico));
}

// Pede ao back-end as últimas buscas guardadas no banco e desenha a lista.
async function carregarHistorico() {
  try {
    const resposta = await fetch(`${URL_BACKEND}/historico`);
    if (!resposta.ok) throw new Error(`Erro ${resposta.status}`);
    mostrarHistorico(await resposta.json());
  } catch {
    const aviso = document.createElement('li');
    aviso.className = 'historico-vazio';
    aviso.textContent = 'Não consegui carregar o histórico.';
    listaHistorico.replaceChildren(aviso);
  }
}

async function buscar(cep) {
  let resposta;
  try {
    resposta = await fetch(`${URL_BACKEND}/cep/${encodeURIComponent(cep)}`);
  } catch {
    mostrarErro(`Não consegui falar com o back-end. Ele está rodando em ${URL_BACKEND}?`);
    return;
  }

  const dados = await resposta.json().catch(() => ({}));
  if (resposta.ok) {
    mostrarEndereco(dados);
  } else {
    // 400, 404, 502...: o back-end já manda uma mensagem clara em "erro".
    mostrarErro(dados.erro ?? `Erro ${resposta.status} ao buscar o CEP.`);
  }
  // Toda busca que chegou ao back-end pode ter entrado no histórico: atualiza a lista.
  await carregarHistorico();
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();

  const cep = campoCep.value.trim();
  if (!cep) {
    mostrarErro('Digite um CEP.');
    return;
  }

  botao.disabled = true;
  botao.textContent = 'Buscando...';
  try {
    await buscar(cep);
  } finally {
    botao.disabled = false;
    botao.textContent = 'Buscar';
  }
});

carregarHistorico();
