import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { sanitizeExpression } from '../guardrails/sanitizeExpression.js';
import { getEnv } from '../../config/env.js';

// Evalúa la expresión con un timeout para evitar evaluaciones costosas (Level 3).
// Level 2 (reemplazar Function por un parser seguro como mathjs) queda pendiente
// como mejora futura que requiere una dependencia adicional.
async function safeEvaluate(expression: string, timeoutMs: number): Promise<string> {
  const sanitized = sanitizeExpression(expression);

  return Promise.race([
    Promise.resolve(String(Function(`"use strict"; return (${sanitized})`)())),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('CALC_TIMEOUT')),
        timeoutMs
      )
    ),
  ]);
}

export const calculatorTool = tool(
  async ({ expression }) => {
    const { AGENT_CALC_TIMEOUT_MS } = getEnv();
    try {
      return await safeEvaluate(expression, AGENT_CALC_TIMEOUT_MS);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return `Error al evaluar la expresión: ${msg}`;
    }
  },
  {
    name: 'calculator',
    description: 'Evalúa operaciones matemáticas simples.',
    schema: z.object({
      expression: z.string().describe('Expresión matemática, por ejemplo: 240 * 0.25'),
    }),
  },
);
