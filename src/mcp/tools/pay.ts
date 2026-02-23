import { AgentspendApiClient } from "../../lib/api.js";
import { normalizeMethod } from "../../lib/request-options.js";
import {
  optionalStringRecord,
  requiredString,
  resolveApiKeyForTool,
  toJsonValue,
  toolSuccess,
} from "../shared.js";

export async function runPayTool(apiClient: AgentspendApiClient, args: Record<string, unknown>) {
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

  return toolSuccess({
    status: response.status,
    body: toJsonValue(response.body),
    charged_usd: response.payment?.charged_usd ?? null,
    remaining_budget_usd: response.payment?.remaining_budget_usd ?? null,
    payment: response.payment
      ? {
          transaction_hash: response.payment.transaction_hash,
          paid_to: response.payment.paid_to,
          charged_currency: response.payment.charged_currency,
        }
      : null,
  });
}
