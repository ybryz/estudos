// Fala com a API pública do ViaCEP: https://viacep.com.br

const TEMPO_LIMITE_MS = 5000;

export class CepNaoEncontrado extends Error {}
export class ViaCepIndisponivel extends Error {}

// Devolve só rua, bairro, cidade e estado.
// Lança CepNaoEncontrado se o CEP não existe e ViaCepIndisponivel se o ViaCEP falhar.
export async function buscarNoViaCep(cep) {
  // O endereço do ViaCEP vem do .env, não fica escrito aqui no código.
  const URL_VIACEP = process.env.VIACEP_URL;
  if (!URL_VIACEP) {
    throw new ViaCepIndisponivel('Falta a variável VIACEP_URL no .env');
  }

  let resposta;
  try {
    resposta = await fetch(`${URL_VIACEP}/${cep}/json/`, {
      signal: AbortSignal.timeout(TEMPO_LIMITE_MS),
    });
  } catch {
    throw new ViaCepIndisponivel('Sem resposta do ViaCEP');
  }

  if (!resposta.ok) {
    throw new ViaCepIndisponivel(`ViaCEP respondeu ${resposta.status}`);
  }

  const dados = await resposta.json().catch(() => {
    throw new ViaCepIndisponivel('Resposta do ViaCEP não é um JSON válido');
  });

  // Para um CEP bem formado que não existe, o ViaCEP responde 200 com { "erro": "true" }.
  if (dados.erro) {
    throw new CepNaoEncontrado('CEP não encontrado');
  }

  return {
    rua: dados.logradouro,
    bairro: dados.bairro,
    cidade: dados.localidade,
    estado: dados.estado,
  };
}
