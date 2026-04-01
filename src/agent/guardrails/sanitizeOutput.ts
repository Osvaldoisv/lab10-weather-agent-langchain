import { logViolation } from './logViolation.js';

// Patrones que pueden indicar credenciales o datos sensibles en el output.
const SENSITIVE_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, label: 'api_key' },
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, label: 'email' },
];

const TRUNCATION_NOTICE = '\n[Respuesta truncada por límite de seguridad]';

/**
 * Filtra el output del agente antes de devolverlo al usuario.
 * Trunca respuestas largas y redacta patrones que parezcan credenciales.
 *
 * @param output    Texto de salida del agente.
 * @param maxLength Límite máximo de caracteres (configurable por entorno).
 * @returns Output sanitizado.
 */
export function sanitizeOutput(output: string, maxLength = 5000): string {
  let result = output;

  // Redactar credenciales en silencio
  for (const { pattern, label } of SENSITIVE_PATTERNS) {
    const before = result;
    result = result.replace(pattern, '[REDACTADO]');
    if (result !== before) {
      logViolation('OUTPUT_SENSITIVE_DATA', { label });
    }
  }

  // Truncar si excede el límite
  if (result.length > maxLength) {
    logViolation('OUTPUT_TOO_LONG', { length: result.length, limit: maxLength });
    result = result.slice(0, maxLength - TRUNCATION_NOTICE.length) + TRUNCATION_NOTICE;
  }

  return result;
}
