import { describe, expect, it } from 'vitest';
import { sanitizeOutput } from '../../src/agent/guardrails/sanitizeOutput.js';

describe('sanitizeOutput', () => {
  it('devuelve output normal sin cambios', () => {
    expect(sanitizeOutput('El resultado es 60')).toBe('El resultado es 60');
  });

  it('redacta API keys tipo sk-...', () => {
    const output = 'Tu clave es sk-abcdefghijklmnopqrstu, guárdala bien.';
    const result = sanitizeOutput(output);
    expect(result).toContain('[REDACTADO]');
    expect(result).not.toContain('sk-abcdefghijklmnopqrstu');
  });

  it('redacta emails', () => {
    const output = 'Contacta a soporte@empresa.com para más info.';
    const result = sanitizeOutput(output);
    expect(result).toContain('[REDACTADO]');
    expect(result).not.toContain('soporte@empresa.com');
  });

  it('trunca output que excede el límite y agrega aviso', () => {
    const longOutput = 'a'.repeat(6000);
    const result = sanitizeOutput(longOutput, 5000);
    expect(result.length).toBeLessThanOrEqual(5000);
    expect(result).toContain('[Respuesta truncada por límite de seguridad]');
  });

  it('no modifica output dentro del límite', () => {
    const short = 'Respuesta corta.';
    expect(sanitizeOutput(short, 5000)).toBe(short);
  });
});
