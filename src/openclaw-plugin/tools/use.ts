import { ApiError, AgentspendApiClient } from "../../lib/api.js";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asPaymentMethodRequiredResult(error: ApiError): Record<string, unknown> | null {
  if (error.status !== 403 || !isRecord(error.body)) {
    return null;
  }

  if (error.body.code !== "PAYMENT_METHOD_REQUIRED") {
    return null;
  }

  return {
    mode: "action_required",
    code: "PAYMENT_METHOD_REQUIRED",
    message:
      typeof error.body.message === "string"
        ? error.body.message
        : "Payment method required. Run agentspend_configure and complete billing setup.",
    configure_url: typeof error.body.configure_url === "string" ? error.body.configure_url : null,
    details: isRecord(error.body.details) ? error.body.details : null,
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

        let response;
        try {
          response = await apiClient.use(apiKey, {
            url,
            method,
            headers,
            body,
          });
        } catch (error) {
          if (error instanceof ApiError) {
            const paymentRequiredResult = asPaymentMethodRequiredResult(error);
            if (paymentRequiredResult) {
              return toolSuccess(paymentRequiredResult);
            }
          }

          throw error;
        }

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
