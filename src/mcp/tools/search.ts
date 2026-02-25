import { FerriteApiClient } from "../../lib/api.js";
import { resolveApiKeyForTool, requiredString, toolSuccess } from "../shared.js";

export async function runSearchTool(apiClient: FerriteApiClient, args: Record<string, unknown>) {
  const query = requiredString(args.query, "query");
  const apiKey = await resolveApiKeyForTool(apiClient);
  const response = await apiClient.search(apiKey, query);

  return toolSuccess({
    query: response.query,
    services: response.services,
  });
}
