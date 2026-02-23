import { AgentspendApiClient } from "../../lib/api.js";
import {
  type AgentToolDefinition,
  requiredString,
  resolveApiKeyForTool,
  toolSuccess,
  withToolErrorHandling,
} from "../shared.js";

export function createSearchTool(apiClient: AgentspendApiClient): AgentToolDefinition {
  return {
    name: "agentspend_search",
    description: "Search AgentSpend services catalog by keyword.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        query: { type: "string", minLength: 1 },
      },
      required: ["query"],
    },
    execute: async (_toolCallId, args) =>
      withToolErrorHandling(async () => {
        const query = requiredString(args.query, "query");
        const apiKey = await resolveApiKeyForTool(apiClient);
        const response = await apiClient.search(apiKey, query);

        return toolSuccess({
          query: response.query,
          services: response.services,
        });
      }),
  };
}
