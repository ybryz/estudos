// Testes do buscarNoViaCep com o fetch simulado (mock): nenhuma chamada sai para a internet.
// Cada teste diz o que o "ViaCEP de mentira" responde e confere o que a função faz com isso.
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { buscarNoViaCep, CepNaoEncontrado, ViaCepIndisponivel } from '../src/viacep.js';

// Monta uma resposta parecida com a do fetch.
function respostaJson(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('buscarNoViaCep com o fetch simulado', () => {
  beforeEach(() => {
    // Um endereço inventado: como o fetch é simulado, ninguém é chamado de verdade.
    vi.stubEnv('VIACEP_URL', 'https://viacep.exemplo/ws');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test('traduz a resposta do ViaCEP para rua, bairro, cidade e estado', async () => {
    const fetchFalso = vi.fn().mockResolvedValue(
      respostaJson({
        cep: '01001-000',
        logradouro: 'Praça da Sé',
        bairro: 'Sé',
        localidade: 'São Paulo',
        estado: 'São Paulo',
        uf: 'SP',
      }),
    );
    vi.stubGlobal('fetch', fetchFalso);

    const endereco = await buscarNoViaCep('01001000');

    expect(endereco).toEqual({
      rua: 'Praça da Sé',
      bairro: 'Sé',
      cidade: 'São Paulo',
      estado: 'São Paulo',
    });
    expect(fetchFalso.mock.calls[0][0]).toBe('https://viacep.exemplo/ws/01001000/json/');
  });

  test('CEP que não existe ({ "erro": "true" }) vira CepNaoEncontrado', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respostaJson({ erro: 'true' })));

    await expect(buscarNoViaCep('99999999')).rejects.toBeInstanceOf(CepNaoEncontrado);
  });

  test('ViaCEP respondendo erro 500 vira ViaCepIndisponivel', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(respostaJson({}, 500)));

    await expect(buscarNoViaCep('01001000')).rejects.toBeInstanceOf(ViaCepIndisponivel);
  });

  test('sem conexão (o fetch falha) vira ViaCepIndisponivel', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    await expect(buscarNoViaCep('01001000')).rejects.toBeInstanceOf(ViaCepIndisponivel);
  });
});
