// o cep só conversa com os outros módulos pela porta da frente (o index.js deles)
import { lerEndereco, guardarEndereco, contarBusca } from '../cache/index.js';
import { registrarBusca } from '../historico/index.js';

export function limparCep(texto) {
  const cep = texto.replace('-', '');
  return /^\d{8}$/.test(cep) ? cep : null;
}

async function buscarNoViaCep(cep) {
  try {
    const dados = await (await fetch(`https://viacep.com.br/ws/${cep}/json/`)).json();
    if (dados.erro) return null;
    return {
      rua: dados.logradouro,
      bairro: dados.bairro,
      cidade: dados.localidade,
      estado: dados.estado,
    };
  } catch {
    return null;
  }
}

// 1º olha no cache; se não achar, vai ao ViaCEP e guarda no cache
export async function buscarEndereco(cep) {
  const buscas = await contarBusca(cep);

  let endereco = await lerEndereco(cep);
  const origem = endereco ? 'cache' : 'viacep';
  console.log(`CEP ${cep}: veio ${endereco ? 'do cache' : 'do ViaCEP'}`);

  if (!endereco) {
    endereco = await buscarNoViaCep(cep);
    if (endereco) await guardarEndereco(cep, endereco);
  }

  await registrarBusca(cep, endereco);
  return endereco ? { ...endereco, origem, buscas } : null;
}
