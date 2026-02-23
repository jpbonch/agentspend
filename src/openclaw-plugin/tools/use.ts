import { AgentspendApiClient } from "../../lib/api.js";
import { formatUseCloudResult } from "../../lib/use-cloud-result.js";
import { normalizeMethod } from "../../lib/request-options.js";
import {
  type AgentToolDefinition,
  optionalStringRecord,
  requiredString,
  resolveApiKeyForTool,
  toolSuccess,
  withToolErrorHandling,
} from "../shared.js";

export function createUseTool(apiClient: AgentspendApiClient): AgentToolDefinition {
  return {
    name: "agentspend_use",
    description: "Call a URL through AgentSpend.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: { type: "string", minLength: 1 },
        method: { type: "string", minLength: 1 },
        headers: {
          type: "object",
          additionalProperties: { type: "string" },
        },
        body: {},
      },
      required: ["url"],
    },
    execute: async (_toolCallId, args) =>
      withToolErrorHandling(async () => {
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
      }),
  };
}
