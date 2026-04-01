import { GuardrailError } from './GuardrailError.js';
import { logViolation } from './logViolation.js';

// Patrones que indican intentos de prompt injection.
// La lista puede ampliarse sin cambiar la lógica de validación.
const SUSPICIOUS_PATTERNS: RegExp[] = [
  /ignore\s+(previous|all)\s+instructions/i,
  /you\s+are\s+now/i,
  /system\s*:\s*/i,
  /\bact\s+as\b/i,
];

/**
 * Valida el input del usuario antes de enviarlo al agente.
 * Rechaza entradas vacías, excesivamente largas o con patrones de injection.
 *
 * @param input     Texto del usuario.
 * @param maxLength Límite máximo de caracteres (configurable por entorno).
 * @returns El input recortado de espacios, listo para usar.
 * @throws GuardrailError si el input viola alguna política.
 */
export function validateInput(input: string, maxLength = 2000): string {
  if (!input || input.trim().length === 0) {
    logViolation('INPUT_EMPTY');
    throw new GuardrailError('INPUT_EMPTY', 'La entrada no puede estar vacía.');
  }

  if (input.length > maxLength) {
    logViolation('INPUT_TOO_LONG', { length: input.length, limit: maxLength });
    throw new GuardrailError(
      'INPUT_TOO_LONG',
      `La entrada excede el límite de ${maxLength} caracteres.`
    );
  }

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(input)) {
      logViolation('INPUT_SUSPICIOUS', { pattern: pattern.source });
      throw new GuardrailError(
        'INPUT_SUSPICIOUS',
        'La entrada contiene patrones no permitidos.'
      );
    }
  }

  return input.trim();
}
