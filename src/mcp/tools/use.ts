import { AgentspendApiClient } from "../../lib/api.js";
import { formatUseCloudResult } from "../../lib/use-cloud-result.js";
import { normalizeMethod } from "../../lib/request-options.js";
import {
  optionalStringRecord,
  requiredString,
  resolveApiKeyForTool,
  toolSuccess,
} from "../shared.js";

export async function runUseTool(apiClient: AgentspendApiClient, args: Record<string, unknown>) {
  const url = requiredString(args.url, "url");
  const methodRaw = args.method;
  const method = methodRaw === undefined ? undefined : normalizeMethod(requiredString(methodRaw, "method"));
  const headers = optionalStringRecord(args.headers, "headers");
  const body = args.body;
  const apiKey = await resolveApiKeyForTool(apiClient);

  const response = await apiClient.use(apiKey, {
    url,
    method,
    headers,
    body,
  });

  if (response.mode === "cloud_http_result") {
    return toolSuccess(formatUseCloudResult(response));
  }

  return toolSuccess({
    mode: response.mode,
    code: response.code,
    message: response.message,
    configure_url: response.configure_url ?? null,
    details: response.details ?? null,
  });
}
