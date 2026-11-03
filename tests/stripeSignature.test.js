import { describe, it, expect } from 'vitest';
import { createHmac } from 'node:crypto';
import { verifyStripeSignature } from '../api/_lib/stripeSignature.js';

const SECRET = 'whsec_test_1234';

function sign(body, secret = SECRET, ts = Math.floor(Date.now() / 1000)) {
  const hmac = createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
  return { header: `t=${ts},v1=${hmac}`, ts, hmac };
}

const BODY = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_live_abc' } } });

describe('verifyStripeSignature', () => {
  it('acepta una firma correcta y reciente', () => {
    const { header } = sign(BODY);
    expect(verifyStripeSignature(BODY, header, SECRET)).toBe(true);
  });
  it('rechaza un cuerpo manipulado tras firmar', () => {
    const { header } = sign(BODY);
    const tampered = BODY.replace('cs_live_abc', 'cs_live_OTHER');
    expect(verifyStripeSignature(tampered, header, SECRET)).toBe(false);
  });
  it('rechaza firma calculada con otro secreto', () => {
    const malicious = sign(BODY, 'whsec_attacker');
    expect(verifyStripeSignature(BODY, malicious.header, SECRET)).toBe(false);
  });
  it('rechaza replay con timestamp fuera de tolerancia', () => {
    const oldTs = Math.floor(Date.now() / 1000) - 301;
    const { header } = sign(BODY, SECRET, oldTs);
    expect(verifyStripeSignature(BODY, header, SECRET)).toBe(false);
    // pero dentro de 5 min sí vale
    const recentTs = Math.floor(Date.now() / 1000) - 200;
    const recent = sign(BODY, SECRET, recentTs);
    expect(verifyStripeSignature(BODY, recent.header, SECRET)).toBe(true);
  });
  it('rechaza cabeceras malformadas', () => {
    expect(verifyStripeSignature(BODY, '', SECRET)).toBe(false);
    expect(verifyStripeSignature(BODY, 't=1', SECRET)).toBe(false);
    expect(verifyStripeSignature(BODY, 'v1=deadbeef', SECRET)).toBe(false);
    expect(verifyStripeSignature(BODY, 'garbage', SECRET)).toBe(false);
  });
  it('rechaza entradas vacías', () => {
    const { header } = sign(BODY);
    expect(verifyStripeSignature('', header, SECRET)).toBe(false);
    expect(verifyStripeSignature(BODY, header, '')).toBe(false);
    expect(verifyStripeSignature(BODY, '', '')).toBe(false);
  });
  it('acepta la segunda firma si la primera es inválida (rotación de claves)', () => {
    const { ts, hmac } = sign(BODY);
    const header = `t=${ts},v1=ffffffffffffffff,v1=${hmac}`;
    expect(verifyStripeSignature(BODY, header, SECRET)).toBe(true);
  });
});
