import { ApiError, AgentspendApiClient } from "../lib/api.js";
import { resolveApiKeyWithAutoClaim } from "../lib/auth-flow.js";
import { formatJson, formatUsd, usd6ToUsd } from "../lib/output.js";
import { normalizeMethod, parseBody, parseHeaders } from "../lib/request-options.js";
import type { UseCloudHttpResult } from "../types.js";

export interface UseCommandOptions {
  method?: string;
  body?: string;
  header?: string[];
}

type UseErrorCode =
  | "PRICE_NOT_CONVERTIBLE"
  | "WEEKLY_BUDGET_EXCEEDED"
  | "SERVICE_DOMAIN_NOT_REGISTERED"
  | "SERVICE_AUTH_REQUIRED";

interface UseErrorDetails {
  weekly_limit_usd6?: number;
  weekly_limit_usd?: number;
  spent_this_week_usd6?: number;
  spent_this_week_usd?: number;
  attempted_charge_usd6?: number;
  attempted_charge_usd?: number;
  estimated_usd?: number;
  amount_display?: string;
  currency?: string;
  configure_url?: string;
}

interface ParsedUseErrorBody {
  code?: UseErrorCode;
  details?: UseErrorDetails;
  message?: string;
  configure_url?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function parseUseErrorCode(value: unknown): UseErrorCode | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  if (
    value === "PRICE_NOT_CONVERTIBLE" ||
    value === "WEEKLY_BUDGET_EXCEEDED" ||
    value === "SERVICE_DOMAIN_NOT_REGISTERED" ||
    value === "SERVICE_AUTH_REQUIRED"
  ) {
    return value;
  }

  return undefined;
}

function parseUseErrorBody(body: unknown): ParsedUseErrorBody {
  if (!isRecord(body)) {
    return {};
  }

  const parsed: ParsedUseErrorBody = {
    code: parseUseErrorCode(body.code),
    message: readString(body, "message"),
    configure_url: readString(body, "configure_url"),
  };

  if (!isRecord(body.details)) {
    return parsed;
  }

  const detailsRecord = body.details;
  parsed.details = {
    weekly_limit_usd6: readNumber(detailsRecord, "weekly_limit_usd6"),
    weekly_limit_usd: readNumber(detailsRecord, "weekly_limit_usd"),
    spent_this_week_usd6: readNumber(detailsRecord, "spent_this_week_usd6"),
    spent_this_week_usd: readNumber(detailsRecord, "spent_this_week_usd"),
    attempted_charge_usd6: readNumber(detailsRecord, "attempted_charge_usd6"),
    attempted_charge_usd: readNumber(detailsRecord, "attempted_charge_usd"),
    estimated_usd: readNumber(detailsRecord, "estimated_usd"),
    amount_display: readString(detailsRecord, "amount_display"),
    currency: readString(detailsRecord, "currency"),
    configure_url: readString(detailsRecord, "configure_url"),
  };

  return parsed;
}

function printCloudHttpResult(result: UseCloudHttpResult): void {
  console.log(formatJson(result.body));

  if (result.payment) {
    console.log(
      `\nCharged: ${formatUsd(result.payment.charged_usd)} | Remaining: ${formatUsd(result.payment.remaining_budget_usd)}`,
    );
  }
}

export async function runUse(apiClient: AgentspendApiClient, url: string, options: UseCommandOptions): Promise<void> {
  const apiKey = await resolveApiKeyWithAutoClaim(apiClient);

  try {
    const response = await apiClient.use(apiKey, {
      url,
      method: options.method ? normalizeMethod(options.method) : undefined,
      headers: parseHeaders(options.header),
      body: parseBody(options.body),
    });

    if (response.mode === "cloud_http_result") {
      printCloudHttpResult(response);
      return;
    }

    if (response.mode === "action_required") {
      const configureUrl = response.configure_url ? `\n${response.configure_url}` : "";
      throw new Error(`${response.message}${configureUrl}`);
    }

    console.log(formatJson(response));
  } catch (error) {
    if (error instanceof ApiError) {
      const body = parseUseErrorBody(error.body);

      if (error.status === 400 && body.code === "PRICE_NOT_CONVERTIBLE") {
        console.error("Price could not be converted to 6-decimal USD units for policy checks.");
        return;
      }

      if (error.status === 402 && body.code === "WEEKLY_BUDGET_EXCEEDED") {
        const weeklyLimit =
          body.details?.weekly_limit_usd ??
          (typeof body.details?.weekly_limit_usd6 === "number" ? usd6ToUsd(body.details.weekly_limit_usd6) : 0);
        const spent =
          body.details?.spent_this_week_usd ??
          (typeof body.details?.spent_this_week_usd6 === "number" ? usd6ToUsd(body.details.spent_this_week_usd6) : 0);
        const attempted =
          body.details?.attempted_charge_usd ??
          (typeof body.details?.attempted_charge_usd6 === "number" ? usd6ToUsd(body.details.attempted_charge_usd6) : 0);

        console.error(
          `Weekly budget exceeded. Limit ${formatUsd(weeklyLimit)}, spent ${formatUsd(spent)}, attempted ${formatUsd(attempted)}.`,
        );
        return;
      }

      if (error.status === 403 && body.code === "SERVICE_DOMAIN_NOT_REGISTERED") {
        console.error("This domain is not registered as an active AgentSpend service domain.");
        return;
      }

      if (error.status === 403 && body.code === "SERVICE_AUTH_REQUIRED") {
        const configureUrl = body.configure_url ?? body.details?.configure_url;
        console.error(
          body.message ??
            `Service authentication required. Complete connection setup in configure.${configureUrl ? `\n${configureUrl}` : ""}`,
        );
        return;
      }
    }

    throw error;
  }
}
