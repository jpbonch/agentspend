import { FerriteApiClient } from "../../lib/api.js";
import {
  type AgentToolDefinition,
  requiredString,
  resolveApiKeyForTool,
  toolSuccess,
  withToolErrorHandling,
} from "../shared.js";

export function createSearchTool(apiClient: FerriteApiClient): AgentToolDefinition {
  return {
    name: "ferrite_search",
    description: "Search Ferrite services catalog by keyword.",
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
