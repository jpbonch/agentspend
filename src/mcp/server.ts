import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { FerriteApiClient } from "../lib/api.js";
import { mcpErrorResult } from "./shared.js";
import { runConfigureTool } from "./tools/configure.js";
import { runSearchTool } from "./tools/search.js";
import { runStatusTool } from "./tools/status.js";
import { runUseTool } from "./tools/use.js";

async function withToolErrorHandling(handler: () => Promise<CallToolResult>): Promise<CallToolResult> {
  try {
    return await handler();
  } catch (error) {
    return mcpErrorResult(error);
  }
}

export async function runMcpServer(): Promise<void> {
  const apiClient = new FerriteApiClient();
  const server = new McpServer({
    name: "ferrite-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "ferrite_configure",
    {
      description: "Start or resume Ferrite configure flow and return a non-blocking configure URL.",
      inputSchema: z.object({}),
    },
    async () => withToolErrorHandling(() => runConfigureTool(apiClient)),
  );

  server.registerTool(
    "ferrite_search",
    {
      description: "Search Ferrite services catalog by keyword.",
      inputSchema: z.object({
        query: z.string().min(1),
      }),
    },
    async (args) => withToolErrorHandling(() => runSearchTool(apiClient, args as Record<string, unknown>)),
  );

  server.registerTool(
    "ferrite_use",
    {
      description: "Call a URL through Ferrite.",
      inputSchema: z.object({
        url: z.string().min(1),
        method: z.string().min(1).optional(),
        headers: z.record(z.string(), z.string()).optional(),
        body: z.unknown().optional(),
      }),
    },
    async (args) => withToolErrorHandling(() => runUseTool(apiClient, args as Record<string, unknown>)),
  );

  server.registerTool(
    "ferrite_status",
    {
      description: "Get weekly budget, current spend, remaining budget, and recent charges.",
      inputSchema: z.object({}),
    },
    async () => withToolErrorHandling(() => runStatusTool(apiClient)),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
