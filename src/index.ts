#!/usr/bin/env node
import { Command } from "commander";
import { runCheck } from "./commands/check.js";
import { runConfigure } from "./commands/configure.js";
import { runPay } from "./commands/pay.js";
import { runSetup } from "./commands/setup.js";
import { runStatus } from "./commands/status.js";
import { AgentspendApiClient } from "./lib/api.js";

function parsePositiveUsd(value: string): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Expected a positive USD value, received: ${value}`);
  }

  const rounded = Math.round(parsed * 1_000_000) / 1_000_000;
  if (Math.abs(parsed - rounded) > 1e-9) {
    throw new Error(`Expected at most 6 decimal places, received: ${value}`);
  }

  return parsed;
}

async function main(): Promise<void> {
  const program = new Command();
  const apiClient = new AgentspendApiClient();

  program.name("agentspend").description("AgentSpend CLI").version("0.2.0");

  program.command("setup").description("Run one-time onboarding").action(async () => {
    await runSetup(apiClient);
  });

  program
    .command("pay")
    .argument("<url>", "URL to call")
    .description("Make a paid request")
    .option("--method <method>", "HTTP method", "GET")
    .option("--body <body>", "Request body (JSON or text)")
    .option("--header <header>", "Header in key:value form", (value, previous: string[]) => {
      return [...previous, value];
    }, [])
    .option("--max-cost <usd>", "Maximum acceptable charge in USD (up to 6 decimals)", parsePositiveUsd)
    .action(async (url: string, options: { method?: string; body?: string; header?: string[]; maxCost?: number }) => {
      await runPay(apiClient, url, options);
    });

  program
    .command("check")
    .argument("<url>", "URL to check")
    .description("Discover endpoint price without paying")
    .action(async (url: string) => {
      await runCheck(apiClient, url);
    });

  program.command("status").description("Show weekly budget and recent charges").action(async () => {
    await runStatus(apiClient);
  });

  program.command("configure").description("Get dashboard configure URL").action(async () => {
    await runConfigure(apiClient);
  });

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
