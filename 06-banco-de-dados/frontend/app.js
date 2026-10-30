const URL_BACKEND = 'http://localhost:3000';

const formulario = document.getElementById('formulario');
const campoCep = document.getElementById('cep');
const resultado = document.getElementById('resultado');
const lista = document.getElementById('historico');

const esc = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

async function carregarHistorico() {
  const buscas = await (await fetch(`${URL_BACKEND}/historico`)).json();
  lista.innerHTML = buscas
    .map((b) => {
      const quando = new Date(b.criadaEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
      const onde = b.endereco ? ` · ${b.endereco.rua}, ${b.endereco.cidade}` : '';
      return `<li class="busca ${b.deuCerto ? 'certo' : 'erro-busca'}">
        <div class="busca-topo"><strong>${esc(b.cep)}</strong>
          <span class="situacao">${b.deuCerto ? 'Deu certo' : 'Não deu certo'}</span></div>
        <div class="busca-detalhe">${quando}${esc(onde)}</div>
      </li>`;
    })
    .join('');
}

formulario.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  const resposta = await fetch(`${URL_BACKEND}/cep/${encodeURIComponent(campoCep.value.trim())}`);
  const dados = await resposta.json();

  if (resposta.ok) {
    resultado.innerHTML = `<dl class="endereco">
      <dt>Rua</dt><dd>${esc(dados.rua) || '—'}</dd>
      <dt>Bairro</dt><dd>${esc(dados.bairro) || '—'}</dd>
      <dt>Cidade</dt><dd>${esc(dados.cidade)}</dd>
      <dt>Estado</dt><dd>${esc(dados.estado)}</dd>
    </dl>`;
  } else {
    resultado.innerHTML = `<div class="erro">${esc(dados.erro)}</div>`;
  }
  carregarHistorico();
});

carregarHistorico();
