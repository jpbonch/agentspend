import type { UseCloudHttpResult } from "../types.js";

const MAX_BODY_CHARS = 6000;
const BODY_PREVIEW_CHARS = 1200;

function toJsonValue(body: unknown): unknown {
  if (body === null) {
    return null;
  }

  if (typeof body === "string" || typeof body === "number" || typeof body === "boolean") {
    return body;
  }

  if (Array.isArray(body)) {
    return body.map((entry) => toJsonValue(entry));
  }

  if (typeof body === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      output[key] = toJsonValue(value);
    }
    return output;
  }

  return String(body);
}

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

export function formatUseCloudResult(result: UseCloudHttpResult): Record<string, unknown> {
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
