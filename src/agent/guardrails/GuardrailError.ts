// Error tipado para todas las violaciones de guardrail.
// Usar un código string facilita logging, métricas y mensajes al usuario
// sin exponer detalles internos del sistema.
export class GuardrailError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'GuardrailError';
  }
}
