#!/usr/bin/env node

import { Command } from "commander";
import { registerCardCommands } from "./commands/card.js";
import { registerWalletCommands } from "./commands/wallet.js";
import { registerPayCommand } from "./commands/pay.js";

const program = new Command();

program
  .name("agentspend")
  .description("AgentSpend CLI — manage cards and billing")
  .version("0.1.0");

registerCardCommands(program);
registerWalletCommands(program);
registerPayCommand(program);

program.parse();
