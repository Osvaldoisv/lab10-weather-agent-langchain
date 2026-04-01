import { runAgent } from "./agent/runAgent.js";

async function main(): Promise<void> {
  const input =
    process.argv.slice(2).join(" ").trim() ||
    "¿Qué clima hace en Santiago? y cuánto es 1983 por 132";

  const output = await runAgent(input, { verbose: true });
  console.log("\nRespuesta del agente:\n");
  console.log(output);
}

main().catch((error) => {
  console.error("Error ejecutando el agente:", error);
  process.exit(1);
});
