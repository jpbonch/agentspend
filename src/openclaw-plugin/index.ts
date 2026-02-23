import { AgentspendApiClient } from "../lib/api.js";
import { buildAgentspendRoutingDirective } from "./hooks/prompt-routing.js";
import { createConfigureTool } from "./tools/configure.js";
import { createPayTool } from "./tools/pay.js";
import { createSearchTool } from "./tools/search.js";
import { createStatusTool } from "./tools/status.js";
import type { AgentToolDefinition } from "./shared.js";

interface OpenClawPluginApi {
  registerTool: (tool: AgentToolDefinition, opts?: { optional?: boolean; names?: string[]; name?: string }) => void;
  on: (hookName: string, handler: (...args: any[]) => any, opts?: { priority?: number }) => void;
  logger?: { debug?: (message: string) => void };
}

export default function register(api: OpenClawPluginApi): void {
  const apiClient = new AgentspendApiClient();

  api.on(
    "before_prompt_build",
    () => {
      api.logger?.debug?.("[agentspend] injected routing directive");
      return { prependContext: buildAgentspendRoutingDirective() };
    },
    { priority: 10 },
  );

  api.registerTool(createConfigureTool(apiClient));
  api.registerTool(createSearchTool(apiClient));
  api.registerTool(createPayTool(apiClient));
  api.registerTool(createStatusTool(apiClient));
}
