import { describe, it, expect } from 'vitest';
import {
  amountToCents, saneStr, validEmail, validPlayers,
  DEFAULT_PRICE_EUR, MAX_AMOUNT_EUR,
} from '../api/_lib/validate.js';

describe('amountToCents', () => {
  it('usa el precio por defecto cuando no llega amount', () => {
    expect(amountToCents(null).cents).toBe(DEFAULT_PRICE_EUR * 100);
    expect(amountToCents(undefined).cents).toBe(DEFAULT_PRICE_EUR * 100);
  });
  it('convierte euros a centavos correctamente', () => {
    expect(amountToCents(8).cents).toBe(800);
    expect(amountToCents('12.5').cents).toBe(1250);
  });
  it('rechaza importes no numéricos', () => {
    expect(amountToCents(Number.NaN).error).toBeTruthy();
    expect(amountToCents('abc').error).toBeTruthy();
  });
  it('rechaza importes por debajo del mínimo', () => {
    expect(amountToCents(0.1).error).toBeTruthy();
  });
  it('rechaza importes por encima del tope', () => {
    expect(amountToCents(MAX_AMOUNT_EUR + 1).error).toContain('máximo');
    expect(amountToCents(1e9).error).toBeTruthy();
  });
});

describe('saneStr', () => {
  it('elimina saltos y recorta espacios', () => {
    expect(saneStr('  Central\n\t2 ')).toBe('Central 2');
  });
  it('limita la longitud', () => {
    expect(saneStr('x'.repeat(500)).length).toBe(120);
  });
  it('devuelve vacío para null/undefined', () => {
    expect(saneStr(null)).toBe('');
    expect(saneStr(undefined)).toBe('');
  });
});

describe('validEmail', () => {
  it('acepta emails razonables', () => {
    expect(validEmail('info@clubpadel.es')).toBe(true);
    expect(validEmail('A.B+t2@sub.dominio.co.uk')).toBe(true);
  });
  it('rechaza basura', () => {
    expect(validEmail('no-es-email')).toBe(false);
    expect(validEmail('')).toBe(false);
    expect(validEmail(null)).toBe(false);
  });
});

describe('validPlayers', () => {
  it('normaliza nombre y email en minúsculas', () => {
    const r = validPlayers([{ email: 'ANA@Mail.es', name: ' Ana ' }, { email: 'beto@x.co' }]);
    expect(r.error).toBeUndefined();
    expect(r.list[0]).toEqual({ name: 'Ana', email: 'ana@mail.es' });
  });
  it('exige mínimo 2 jugadores', () => {
    expect(validPlayers([{ email: 'a@b.co' }]).error).toContain('al menos 2');
  });
  it('rechaza si algún email es inválido', () => {
    expect(validPlayers([{ email: 'a@b.co' }, { email: 'malo' }]).error).toBeTruthy();
  });
  it('rechaza listas demasiado largas', () => {
    const many = Array.from({ length: 17 }, (_, i) => ({ email: `p${i}@x.co` }));
    expect(validPlayers(many).error).toContain('máximo');
  });
});
