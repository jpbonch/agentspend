import { AgentspendApiClient } from "../../lib/api.js";
import { normalizeMethod } from "../../lib/request-options.js";
import type { UseCloudHttpResult } from "../../types.js";
import {
  optionalStringRecord,
  requiredString,
  resolveApiKeyForTool,
  toJsonValue,
  toolSuccess,
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
    payment: result.payment
      ? {
          transaction_hash: result.payment.transaction_hash,
          paid_to: result.payment.paid_to,
          charged_currency: result.payment.charged_currency,
        }
      : null,
  };
}

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
    return toolSuccess(formatCloudResult(response));
  }

  return toolSuccess({
    mode: response.mode,
    code: response.code,
    message: response.message,
    configure_url: response.configure_url ?? null,
    details: response.details ?? null,
  });
}
