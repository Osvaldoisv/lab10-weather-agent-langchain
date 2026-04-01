# Changelog

## 0.2.0 - 2026-04-01

- Added `weather` tool integrating WeatherAPI.com for current conditions and day forecast.
- Responses include temperature, rain probability, UV index, thermal amplitude, and clothing advice.
- Tool output capped at 500 characters with graceful truncation.
- Added `WEATHER_API_KEY` to environment schema and `.env.example`.
- Updated agent prompt to describe when and how to invoke the weather tool.
- Added `tests/weather.test.ts` with 11 tests covering recommendations, formatting, and error handling.
- Updated `README.md` with weather setup instructions and example questions.
- Updated `docs/guardrails.md` with weather tool section.

## 0.1.1 - 2026-03-22

- Migrated provider configuration from OpenAI env keys to OpenRouter env keys.
- Updated model initialization to use OpenRouter base URL and optional `HTTP-Referer` / `X-Title` headers.
- Updated local environment template and documentation for OpenRouter setup.

## 0.1.0 - 2026-03-22

- Initial project setup with TypeScript ESM and npm.
- LangChain agent implementation using `createToolCallingAgent` and `AgentExecutor`.
- Included tools: `calculator` and `current_time`.
- CLI entry point to run questions from the terminal.
- Vitest tests for tools and runner.
- Initial documentation (`README.md` and `docs/architecture.md`).
- Local environment template in `env.local`.
