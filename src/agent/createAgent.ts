import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { createModel } from "./model.js";
import { calculatorTool } from "./tools/calculator.js";
import { currentTimeTool } from "./tools/currentTime.js";
import { weatherTool } from "./tools/weather.js";
import { agentPrompt } from "./prompt.js";
import { getEnv } from "../config/env.js";

export const agentTools = [calculatorTool, currentTimeTool, weatherTool];

export async function buildAgentExecutor(verbose?: boolean): Promise<AgentExecutor> {
  const env = getEnv();
  const model = createModel();

  const agent = await createToolCallingAgent({
    llm: model,
    tools: agentTools,
    prompt: agentPrompt
  });

  return new AgentExecutor({
    agent,
    tools: agentTools,
    // verbose por parámetro explícito; si no se pasa, usa el valor del entorno
    verbose: verbose ?? env.AGENT_VERBOSE,
    maxIterations: env.AGENT_MAX_ITERATIONS,
    earlyStoppingMethod: "force",
  });
}
