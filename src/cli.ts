import { Command } from "commander";
import { createRequire } from "node:module";
import { runConfigure } from "./commands/configure.js";
import { runUse } from "./commands/use.js";
import { runSearch } from "./commands/search.js";
import { runStatus } from "./commands/status.js";
import { FerriteApiClient } from "./lib/api.js";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json") as { version?: string };
const CLI_VERSION = typeof packageJson.version === "string" ? packageJson.version : "0.0.0";

export async function runCli(options?: { baseUrl?: string; programName?: string }): Promise<void> {
  const program = new Command();
  const apiClient = new FerriteApiClient(options?.baseUrl);
  const programName = options?.programName ?? "ferrite";

  program.name(programName).description("Ferrite CLI").version(CLI_VERSION);

  program
    .command("use")
    .argument("<url>", "Direct HTTPS URL")
    .description("Call a URL through Ferrite")
    .option("-X, --method <method>", "HTTP method")
    .option("--body <body>", "Request body (JSON or text)")
    .option("--header <header>", "Header in key:value form", (value, previous: string[]) => {
      return [...previous, value];
    }, [])
    .action(async (url: string, commandOptions: { method?: string; body?: string; header?: string[] }) => {
      await runUse(apiClient, url, commandOptions);
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
