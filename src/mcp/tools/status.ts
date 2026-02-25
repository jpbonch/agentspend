import { FerriteApiClient } from "../../lib/api.js";
import { resolveApiKeyForTool, toJsonValue, toolSuccess } from "../shared.js";

export async function runStatusTool(apiClient: FerriteApiClient) {
  const apiKey = await resolveApiKeyForTool(apiClient);
  const response = await apiClient.status(apiKey);

  return toolSuccess({
    weekly_budget_usd: response.weekly_budget_usd,
    spent_this_week_usd: response.spent_this_week_usd,
    remaining_budget_usd: response.remaining_budget_usd,
    recent_charges: toJsonValue(response.recent_charges),
  });
}
