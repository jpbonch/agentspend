import { AgentspendApiClient } from "../../lib/api.js";
import {
  type AgentToolDefinition,
  resolveApiKeyForTool,
  toJsonValue,
  toolSuccess,
  withToolErrorHandling,
} from "../shared.js";

export function createStatusTool(apiClient: AgentspendApiClient): AgentToolDefinition {
  return {
    name: "agentspend_status",
    description: "Get weekly budget, current spend, remaining budget, and recent charges.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
    execute: async () =>
      withToolErrorHandling(async () => {
        const apiKey = await resolveApiKeyForTool(apiClient);
        const response = await apiClient.status(apiKey);

        return toolSuccess({
          weekly_budget_usd: response.weekly_budget_usd,
          spent_this_week_usd: response.spent_this_week_usd,
          remaining_budget_usd: response.remaining_budget_usd,
          recent_charges: toJsonValue(response.recent_charges),
        });
      }),
  };
}
