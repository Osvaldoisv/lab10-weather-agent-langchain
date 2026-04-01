import { GuardrailError } from './GuardrailError.js';
import { logViolation } from './logViolation.js';

// Allowlist estricta: solo dígitos, espacios y operadores aritméticos básicos.
// Cualquier carácter fuera de este conjunto es rechazado.
const ALLOWED_CHARS = /^[\d\s+\-*/().,%^]+$/;
const MAX_EXPRESSION_LENGTH = 200;

/**
 * Valida que una expresión matemática solo contenga caracteres permitidos
 * y no exceda la longitud máxima.
 *
 * @param expression Expresión a evaluar.
 * @returns La misma expresión si es válida.
 * @throws GuardrailError si contiene caracteres prohibidos o es demasiado larga.
 */
export function sanitizeExpression(expression: string): string {
  if (!expression || expression.trim().length === 0) {
    logViolation('CALC_INVALID_EXPRESSION', { reason: 'empty' });
    throw new GuardrailError(
      'CALC_INVALID_EXPRESSION',
      'La expresión no puede estar vacía.'
    );
  }

  if (expression.length > MAX_EXPRESSION_LENGTH) {
    logViolation('CALC_EXPRESSION_TOO_LONG', { length: expression.length });
    throw new GuardrailError(
      'CALC_EXPRESSION_TOO_LONG',
      `La expresión excede ${MAX_EXPRESSION_LENGTH} caracteres.`
    );
  }

  if (!ALLOWED_CHARS.test(expression)) {
    logViolation('CALC_INVALID_EXPRESSION', { expression });
    throw new GuardrailError(
      'CALC_INVALID_EXPRESSION',
      `La expresión contiene caracteres no permitidos: "${expression}"`
    );
  }

  return expression;
}
