import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { AgentspendApiClient } from "../lib/api.js";
import { mcpErrorResult } from "./shared.js";
import { runConfigureTool } from "./tools/configure.js";
import { runPayTool } from "./tools/pay.js";
import { runSearchTool } from "./tools/search.js";
import { runStatusTool } from "./tools/status.js";

async function withToolErrorHandling(handler: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await handler();
  } catch (error) {
    return mcpErrorResult(error);
  }
}

export async function runMcpServer(): Promise<void> {
  const apiClient = new AgentspendApiClient();
  const server = new McpServer({
    name: "agentspend-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "agentspend_configure",
    {
      description: "Start or resume AgentSpend configure flow and return a non-blocking configure URL.",
      inputSchema: z.object({}),
    },
    async () => withToolErrorHandling(() => runConfigureTool(apiClient)),
  );

  server.registerTool(
    "agentspend_search",
    {
      description: "Search AgentSpend services catalog by keyword.",
      inputSchema: z.object({
        query: z.string().min(1),
      }),
    },
    async (args) => withToolErrorHandling(() => runSearchTool(apiClient, args as Record<string, unknown>)),
  );

  server.registerTool(
    "agentspend_pay",
    {
      description: "Execute a paid API request through AgentSpend.",
      inputSchema: z.object({
        url: z.string().url(),
        method: z.string().min(1),
        headers: z.record(z.string(), z.string()).optional(),
        body: z.unknown().optional(),
      }),
    },
    async (args) => withToolErrorHandling(() => runPayTool(apiClient, args as Record<string, unknown>)),
  );

  server.registerTool(
    "agentspend_status",
    {
      description: "Get weekly budget, current spend, remaining budget, and recent charges.",
      inputSchema: z.object({}),
    },
    async () => withToolErrorHandling(() => runStatusTool(apiClient)),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
