import { AgentspendApiClient } from "../../lib/api.js";
import { normalizeMethod } from "../../lib/request-options.js";
import type { UseCloudHttpResult } from "../../types.js";
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

function formatCloudResult(result: UseCloudHttpResult) {
  const compactBody = compactResponseBody(result.body);
  return {
    mode: result.mode,
    status: result.status,
    body: compactBody.body,
    body_omitted: compactBody.body_omitted,
    charged_usd: result.payment?.charged_usd ?? null,
    remaining_budget_usd: result.payment?.remaining_budget_usd ?? null,
  };
}

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
          return toolSuccess(formatCloudResult(response));
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
