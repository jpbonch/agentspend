#!/usr/bin/env node

import { Command } from "commander";
import { registerWalletCommands } from "./commands/wallet.js";

const program = new Command();

program
  .name("agentspend")
  .description("AgentSpend CLI — manage wallets and billing")
  .version("0.1.0");

registerWalletCommands(program);

program.parse();
