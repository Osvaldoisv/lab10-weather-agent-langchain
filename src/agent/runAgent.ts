import type { AgentExecutor } from "langchain/agents";
import { buildAgentExecutor } from "./createAgent.js";
import { validateInput } from "./guardrails/validateInput.js";
import { sanitizeOutput } from "./guardrails/sanitizeOutput.js";
import { GuardrailError } from "./guardrails/GuardrailError.js";
import { getEnv } from "../config/env.js";

type AgentInvoker = Pick<AgentExecutor, "invoke">;

export interface RunAgentOptions {
  executor?: AgentInvoker;
  verbose?: boolean;
}

export async function runAgent(
  input: string,
  options: RunAgentOptions = {}
): Promise<string> {
  const env = getEnv();

  // Pre-Input Guard: validar antes de invocar al agente
  if (env.AGENT_ENABLE_INPUT_FILTER) {
    try {
      input = validateInput(input, env.AGENT_MAX_INPUT_LENGTH);
    } catch (err) {
      if (err instanceof GuardrailError) return err.message;
      throw err;
    }
  }

  const executor = options.executor ?? (await buildAgentExecutor(options.verbose));
  const result = await executor.invoke({ input });
  let output = String(result.output ?? "");

  // Post-Output Guard: filtrar antes de devolver al usuario
  if (env.AGENT_ENABLE_OUTPUT_FILTER) {
    output = sanitizeOutput(output, env.AGENT_MAX_OUTPUT_LENGTH);
  }

  return output;
}
