// Testes de integração: sobem o app de verdade (Express) e chamam a rota /cep pela rede local.
// O ViaCEP é simulado (mock): no lugar dele entra uma função de mentira criada com vi.fn(),
// então os testes não precisam de internet e sempre dão o mesmo resultado.
import { describe, test, expect, vi } from 'vitest';
import { criarApp } from '../src/app.js';
import { CepNaoEncontrado, ViaCepIndisponivel } from '../src/viacep.js';

const PRACA_DA_SE = {
  rua: 'Praça da Sé',
  bairro: 'Sé',
  cidade: 'São Paulo',
  estado: 'São Paulo',
};

// Sobe o app numa porta livre com o ViaCEP simulado, faz um GET e desliga o app.
async function chamar(caminho, viaCepSimulado) {
  const servidor = criarApp({ buscarCep: viaCepSimulado }).listen(0);
  try {
    const { port } = servidor.address();
    const resposta = await fetch(`http://localhost:${port}${caminho}`);
    return { status: resposta.status, corpo: await resposta.json() };
  } finally {
    servidor.close();
  }
}

describe('rota GET /cep/:cep com o ViaCEP simulado', () => {
  test('200: devolve rua, bairro, cidade e estado', async () => {
    const viaCep = vi.fn().mockResolvedValue(PRACA_DA_SE);

    const { status, corpo } = await chamar('/cep/01001-000', viaCep);

    expect(status).toBe(200);
    expect(corpo).toEqual(PRACA_DA_SE);
    // O ViaCEP foi chamado uma vez, já com o CEP sem o traço.
    expect(viaCep).toHaveBeenCalledTimes(1);
    expect(viaCep).toHaveBeenCalledWith('01001000');
  });

  test('400: CEP inválido nem chega no ViaCEP', async () => {
    const viaCep = vi.fn();

    const { status, corpo } = await chamar('/cep/abc', viaCep);

    expect(status).toBe(400);
    expect(corpo.erro).toMatch(/CEP inválido/);
    expect(viaCep).not.toHaveBeenCalled();
  });

  test('404: o ViaCEP diz que o CEP não existe', async () => {
    const viaCep = vi.fn().mockRejectedValue(new CepNaoEncontrado());

    const { status, corpo } = await chamar('/cep/99999999', viaCep);

    expect(status).toBe(404);
    expect(corpo.erro).toBe('CEP não encontrado.');
  });

  test('502: o ViaCEP está fora do ar', async () => {
    const viaCep = vi.fn().mockRejectedValue(new ViaCepIndisponivel());

    const { status, corpo } = await chamar('/cep/01001000', viaCep);

    expect(status).toBe(502);
    expect(corpo.erro).toMatch(/ViaCEP/);
  });

  test('500: erro inesperado vira uma mensagem genérica', async () => {
    const viaCep = vi.fn().mockRejectedValue(new Error('qualquer coisa'));

    const { status, corpo } = await chamar('/cep/01001000', viaCep);

    expect(status).toBe(500);
    expect(corpo.erro).toBe('Erro inesperado no servidor.');
  });
});
