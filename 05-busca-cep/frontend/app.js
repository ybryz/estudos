// Endereço do SEU back-end. O front nunca chama o ViaCEP direto.
const URL_BACKEND = 'http://localhost:3000';

const formulario = document.getElementById('formulario');
const campoCep = document.getElementById('cep');
const botao = document.getElementById('botao');
const resultado = document.getElementById('resultado');

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
