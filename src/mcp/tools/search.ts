import { FerriteApiClient } from "../../lib/api.js";
import { resolveApiKeyForTool, requiredString, toolSuccess } from "../shared.js";

export async function runSearchTool(apiClient: FerriteApiClient, args: Record<string, unknown>) {
  const query = requiredString(args.query, "query");
  const apiKey = await resolveApiKeyForTool(apiClient);
  const response = await apiClient.search(apiKey, query);
  const services = response.services.map((service) => ({
    name: service.name,
    description: service.description,
    skill_url: service.skill_url,
  }));

  return toolSuccess({
    query: response.query,
    services,
  });
}
