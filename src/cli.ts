import { Command } from "commander";
import { runConfigure } from "./commands/configure.js";
import { runPay } from "./commands/pay.js";
import { runSearch } from "./commands/search.js";
import { runStatus } from "./commands/status.js";
import { AgentspendApiClient } from "./lib/api.js";

export async function runCli(options?: { baseUrl?: string; programName?: string }): Promise<void> {
  const program = new Command();
  const apiClient = new AgentspendApiClient(options?.baseUrl);
  const programName = options?.programName ?? "agentspend";

  program.name(programName).description("AgentSpend CLI").version("0.2.0");

  program
    .command("pay")
    .argument("<url>", "URL to call")
    .description("Make a paid request")
    .option("-X, --method <method>", "HTTP method for target request", "GET")
    .option("--body <body>", "Request body (JSON or text)")
    .option("--header <header>", "Header in key:value form", (value, previous: string[]) => {
      return [...previous, value];
    }, [])
    .action(async (url: string, commandOptions: { method?: string; body?: string; header?: string[] }) => {
      await runPay(apiClient, url, commandOptions);
    });

  program
    .command("search")
    .argument("<query...>", "Keyword query")
    .description("Search services by name and description")
    .action(async (queryParts: string[]) => {
      await runSearch(apiClient, queryParts.join(" "));
    });

  program.command("status").description("Show weekly budget and recent charges").action(async () => {
    await runStatus(apiClient);
  });

  program.command("configure").description("Run onboarding/configuration flow").action(async () => {
    await runConfigure(apiClient);
  });

  await program.parseAsync(process.argv);
}
