# 10Xbuilder Agents

Agent with LangChain and TypeScript (ESM) that uses tools to solve calculations and return the current time.

## Requirements

- Node.js 20+
- npm 10+
- OpenRouter API key
- WeatherAPI.com API key (free tier at [weatherapi.com](https://www.weatherapi.com))

## Installation

```bash
npm install
```

## Environment setup

This project loads configuration from `env.local` at the repository root.

```bash
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_TEMPERATURE=0
OPENROUTER_HTTP_REFERER=https://your-app-domain.com
OPENROUTER_APP_TITLE=10Xbuilder Agents
WEATHER_API_KEY=your_weatherapi_key
```

Get a free key at [weatherapi.com](https://www.weatherapi.com) (free tier supports up to 1 million calls/month).

## Run in development

```bash
npm run dev
```

With a custom question:

```bash
npm run dev -- "What is 25% of 240 and what time is it now?"
```

## Scripts

- `npm run dev`: runs the agent with `tsx`.
- `npm run build`: compiles to `dist/`.
- `npm run start`: runs the compiled build.
- `npm run test`: runs tests once.
- `npm run test:watch`: runs tests in watch mode.
- `npm run lint`: runs ESLint.
- `npm run typecheck`: validates types without emitting build output.

## Architecture overview

The project is organized in layers so each concern stays isolated and easy to evolve:

- **Interface layer**: `src/index.ts` provides a CLI entry point and sends user input to the agent runtime.
- **Application layer**: `src/agent/runAgent.ts` exposes a single execution function and supports dependency injection for testing.
- **Composition layer**: `src/agent/createAgent.ts` assembles model, prompt, and tools into an `AgentExecutor`.
- **Domain capabilities**: `src/agent/tools/*` defines reusable tools such as `calculator`, `current_time`, and `weather`.
- **Configuration layer**: `src/config/env.ts` loads and validates environment variables with `zod`.

For a deeper architectural breakdown, see `docs/architecture.md`. For security guardrails, see `docs/guardrails.md`.

## Project structure

- `src/index.ts`: CLI entry point.
- `src/config/env.ts`: environment loading and validation.
- `src/agent`: agent setup, prompt, tools, and runner.
- `tests`: Vitest test suite.
- `docs/architecture.md`: architecture documentation.
- `docs/guardrails.md`: guardrails implementation guide.

## Add a new tool

1. Create a new file in `src/agent/tools`.
2. Export the tool using LangChain `tool(...)`.
3. Register it in `src/agent/createAgent.ts`.
4. Update `src/agent/prompt.ts` to describe when to use it.

## Weather tool

The `weather` tool queries [WeatherAPI.com](https://www.weatherapi.com) for current conditions and the day's forecast.

Example questions the agent can answer:

- `"¿Qué clima hace hoy en Santiago?"`
- `"¿Va a llover en Buenos Aires?"`
- `"¿Necesito paraguas en Madrid?"`
- `"¿Qué ropa me pongo si estoy en Ciudad de México?"`

The tool requires an explicit city name. Responses are capped at 500 characters and include temperature, rain probability, UV index, and clothing recommendations.

## Notes

The `calculator` tool currently uses `Function(...)`. For production usage, replace it with a safe parser/evaluator.
