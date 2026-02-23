#!/usr/bin/env node
import { runMcpServer } from "./mcp/server.js";

runMcpServer().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
