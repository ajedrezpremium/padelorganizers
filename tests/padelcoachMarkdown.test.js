import { describe, it, expect } from 'vitest';
import { escapeHtml, renderMd } from '../src/lib/markdown';

describe('markdown seguro (PadelCoach)', () => {
  it('escapa <script> y no inyecta', () => {
    const out = renderMd('<script>alert(1)</script>');
    expect(out).not.toMatch(/<script>/i);
    expect(out).toContain('&lt;script&gt;');
  });
  it('convierte negrita y cursiva', () => {
    expect(renderMd('**negrita**')).toBe('<strong>negrita</strong>');
    expect(renderMd('*cursiva*')).toBe('<em>cursiva</em>');
    expect(renderMd('__b__ y _i_')).toBe('<strong>b</strong> y <em>i</em>');
  });
  it('convierte saltos de línea a <br />', () => {
    expect(renderMd('línea1\nlínea2')).toBe('línea1<br />línea2');
  });
  it('mostrado de código inline', () => {
    expect(renderMd('usa `npm test`')).toContain('<code');
  });
  it('escapeHtml maneja null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
  });
});
