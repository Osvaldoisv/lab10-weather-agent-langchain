import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: 'env.local' }); // carga env.local si existe
dotenv.config();                       // fallback a .env para variables no definidas aún

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().min(1, 'OPENROUTER_API_KEY is required'),
  OPENROUTER_MODEL: z.string().default('openai/gpt-4o-mini'),
  OPENROUTER_BASE_URL: z.string().url().default('https://openrouter.ai/api/v1'),
  OPENROUTER_TEMPERATURE: z.coerce.number().default(0),
  OPENROUTER_HTTP_REFERER: z.string().url().optional(),
  OPENROUTER_APP_TITLE: z.string().min(1).optional(),
  WEATHER_API_KEY: z.string().min(1, 'WEATHER_API_KEY is required'),

  // Guardrails — valores por defecto seguros para producción
  AGENT_MAX_INPUT_LENGTH: z.coerce.number().default(2000),
  AGENT_MAX_OUTPUT_LENGTH: z.coerce.number().default(5000),
  AGENT_MAX_ITERATIONS: z.coerce.number().default(5),
  AGENT_VERBOSE: z.coerce.boolean().default(false),
  AGENT_CALC_TIMEOUT_MS: z.coerce.number().default(1000),
  AGENT_ENABLE_INPUT_FILTER: z.coerce.boolean().default(true),
  AGENT_ENABLE_OUTPUT_FILTER: z.coerce.boolean().default(true),
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(): AppEnv {
  return envSchema.parse(process.env);
}
