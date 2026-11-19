// Testes unitários: testam só a função normalizarCep, sozinha, sem servidor e sem internet.
import { describe, test, expect } from 'vitest';
import { normalizarCep } from '../src/app.js';

describe('validação do CEP (normalizarCep)', () => {
  test('aceita CEP com traço e devolve só os 8 números', () => {
    expect(normalizarCep('01001-000')).toBe('01001000');
  });

  test('aceita CEP sem traço', () => {
    expect(normalizarCep('01001000')).toBe('01001000');
  });

  test('ignora espaços antes e depois', () => {
    expect(normalizarCep('  01001-000 ')).toBe('01001000');
  });

  test('recusa CEP com letras', () => {
    expect(normalizarCep('abcdefgh')).toBeNull();
    expect(normalizarCep('0100100a')).toBeNull();
    expect(normalizarCep('01001-00x')).toBeNull();
  });

  test('recusa CEP curto demais', () => {
    expect(normalizarCep('123')).toBeNull();
    expect(normalizarCep('0100100')).toBeNull();
    expect(normalizarCep('01001-00')).toBeNull();
  });

  test('recusa CEP longo demais, vazio ou com traço no lugar errado', () => {
    expect(normalizarCep('010010000')).toBeNull();
    expect(normalizarCep('')).toBeNull();
    expect(normalizarCep('0100-1000')).toBeNull();
  });
});
