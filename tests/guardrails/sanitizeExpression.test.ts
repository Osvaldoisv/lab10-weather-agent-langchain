import { describe, expect, it } from 'vitest';
import { sanitizeExpression } from '../../src/agent/guardrails/sanitizeExpression.js';
import { GuardrailError } from '../../src/agent/guardrails/GuardrailError.js';

describe('sanitizeExpression', () => {
  it('acepta aritmética simple', () => {
    expect(sanitizeExpression('240 * 0.25')).toBe('240 * 0.25');
  });

  it('acepta expresión con paréntesis', () => {
    expect(sanitizeExpression('(10 + 5) * 2')).toBe('(10 + 5) * 2');
  });

  it('lanza CALC_INVALID_EXPRESSION para caracteres prohibidos', () => {
    try { sanitizeExpression('process.exit(1)'); } catch (e) {
      expect((e as GuardrailError).code).toBe('CALC_INVALID_EXPRESSION');
    }
  });

  it('lanza CALC_INVALID_EXPRESSION para letras en la expresión', () => {
    try { sanitizeExpression('abc + 1'); } catch (e) {
      expect((e as GuardrailError).code).toBe('CALC_INVALID_EXPRESSION');
    }
  });

  it('lanza CALC_INVALID_EXPRESSION para expresión vacía', () => {
    try { sanitizeExpression(''); } catch (e) {
      expect((e as GuardrailError).code).toBe('CALC_INVALID_EXPRESSION');
    }
  });

  it('lanza CALC_EXPRESSION_TOO_LONG cuando excede 200 chars', () => {
    try { sanitizeExpression('1+'.repeat(101)); } catch (e) {
      expect((e as GuardrailError).code).toBe('CALC_EXPRESSION_TOO_LONG');
    }
  });
});
