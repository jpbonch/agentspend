import { AgentspendApiClient } from "../../lib/api.js";
import { normalizeMethod } from "../../lib/request-options.js";
import {
  type AgentToolDefinition,
  optionalStringRecord,
  requiredString,
  resolveApiKeyForTool,
  toJsonValue,
  toolSuccess,
  withToolErrorHandling,
} from "../shared.js";

const MAX_BODY_CHARS = 6000;
const BODY_PREVIEW_CHARS = 1200;

function compactResponseBody(body: unknown): { body: unknown; body_omitted: boolean } {
  const jsonBody = toJsonValue(body);
  const serialized = JSON.stringify(jsonBody);

  if (!serialized || serialized.length <= MAX_BODY_CHARS) {
    return { body: jsonBody, body_omitted: false };
  }

  return {
    body: {
      note: "Response body omitted because it is large (common for base64 media payloads).",
      size_chars: serialized.length,
      preview: serialized.slice(0, BODY_PREVIEW_CHARS),
    },
    body_omitted: true,
  };
}

export function createPayTool(apiClient: AgentspendApiClient): AgentToolDefinition {
  return {
    name: "agentspend_pay",
    description: "Execute a paid API request through AgentSpend.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        url: { type: "string", format: "uri" },
        method: { type: "string", minLength: 1 },
        headers: {
          type: "object",
          additionalProperties: { type: "string" },
        },
        body: {},
      },
      required: ["url", "method"],
    },
    execute: async (_toolCallId, args) =>
      withToolErrorHandling(async () => {
        const url = requiredString(args.url, "url");
        const method = normalizeMethod(requiredString(args.method, "method"));
        const headers = optionalStringRecord(args.headers, "headers");
        const body = args.body;
        const apiKey = await resolveApiKeyForTool(apiClient);

        const response = await apiClient.pay(apiKey, {
          url,
          method,
          headers,
          body,
        });
        const compactBody = compactResponseBody(response.body);

        return toolSuccess({
          status: response.status,
          body: compactBody.body,
          body_omitted: compactBody.body_omitted,
          charged_usd: response.payment?.charged_usd ?? null,
          remaining_budget_usd: response.payment?.remaining_budget_usd ?? null,
        });
      }),
  };
}
