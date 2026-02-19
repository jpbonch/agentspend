import { ApiError, AgentspendApiClient } from "../lib/api.js";
import { requireApiKey } from "../lib/credentials.js";
import { formatJson, formatPaymentRequirementDetails, formatUsd, formatUsdEstimate, usd6ToUsd } from "../lib/output.js";
import type { PaymentRequirementInfo, PayResponse } from "../types.js";

export interface PayCommandOptions {
  method?: string;
  body?: string;
  header?: string[];
  maxCost?: number;
}

function parseHeaders(rawHeaders: string[] | undefined): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (const header of rawHeaders ?? []) {
    const separator = header.indexOf(":");
    if (separator === -1) {
      throw new Error(`Invalid header format: ${header}. Expected key:value.`);
    }

    const key = header.slice(0, separator).trim();
    const value = header.slice(separator + 1).trim();

    if (!key || !value) {
      throw new Error(`Invalid header format: ${header}. Expected key:value.`);
    }

    parsed[key] = value;
  }

  return parsed;
}

function parseBody(rawBody: string | undefined): unknown {
  if (rawBody === undefined) {
    return undefined;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function requirementFromPayResponse(response: PayResponse): PaymentRequirementInfo | null {
  if (response.payment_requirement) {
    return response.payment_requirement;
  }

  if (!response.payment) {
    return null;
  }

  return {
    price_usd6: response.payment.charged_usd6,
    price_usd: response.payment.charged_usd,
    estimated_usd: response.payment.estimated_usd,
    currency: response.payment.charged_currency,
    pay_to: response.payment.paid_to,
    amount_minor: response.payment.charged_amount_minor,
    amount_display: response.payment.charged_amount_display,
    decimals: null,
    description: null,
    network: response.payment.network,
    scheme: response.payment.scheme,
    resource: response.payment.resource,
    max_timeout_seconds: null,
    mime_type: null,
    pricing_note: response.payment.pricing_note,
  };
}

function requirementFromErrorDetails(details: unknown): PaymentRequirementInfo | null {
  if (!details || typeof details !== "object") {
    return null;
  }

  const candidate = details as Record<string, unknown>;
  if (typeof candidate.currency !== "string") {
    return null;
  }

  return {
    price_usd6: typeof candidate.price_usd6 === "number" ? candidate.price_usd6 : null,
    price_usd: typeof candidate.price_usd === "number" ? candidate.price_usd : null,
    estimated_usd: typeof candidate.estimated_usd === "number" ? candidate.estimated_usd : null,
    currency: candidate.currency,
    pay_to: typeof candidate.pay_to === "string" ? candidate.pay_to : null,
    amount_minor: typeof candidate.amount_minor === "number" ? candidate.amount_minor : null,
    amount_display: typeof candidate.amount_display === "string" ? candidate.amount_display : null,
    decimals: typeof candidate.decimals === "number" ? candidate.decimals : null,
    description: typeof candidate.description === "string" ? candidate.description : null,
    network: typeof candidate.network === "string" ? candidate.network : null,
    scheme: typeof candidate.scheme === "string" ? candidate.scheme : null,
    resource: typeof candidate.resource === "string" ? candidate.resource : null,
    max_timeout_seconds:
      typeof candidate.max_timeout_seconds === "number" ? candidate.max_timeout_seconds : null,
    mime_type: typeof candidate.mime_type === "string" ? candidate.mime_type : null,
    pricing_note: typeof candidate.pricing_note === "string" ? candidate.pricing_note : null,
  };
}

export async function runPay(apiClient: AgentspendApiClient, url: string, options: PayCommandOptions): Promise<void> {
  const apiKey = await requireApiKey();
  const method = (options.method ?? "GET").toUpperCase();

  try {
    const response = await apiClient.pay(apiKey, {
      url,
      method,
      headers: parseHeaders(options.header),
      body: parseBody(options.body),
      max_cost_usd: options.maxCost,
    });

    console.log(formatJson(response.body));

    if (response.payment) {
      const requirement = requirementFromPayResponse(response);

      if (requirement) {
        console.log("\nPayment requirement:");
        console.log(formatPaymentRequirementDetails(requirement));
      }

      console.log(
        `\nCharged: ${formatUsd(response.payment.charged_usd)} | Remaining: ${formatUsd(response.payment.remaining_budget_usd)}`,
      );

      if (response.payment.transaction_hash) {
        console.log(`Transaction: ${response.payment.transaction_hash}`);
      }

      if (response.payment.pricing_note) {
        console.log(`Note: ${response.payment.pricing_note}`);
      }
    } else {
      console.log("\nNo payment required.");
    }
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as {
        code?: string;
        details?: {
          offered_price_usd6?: number;
          offered_price_usd?: number;
          max_cost_usd6?: number;
          max_cost_usd?: number;
          weekly_limit_usd6?: number;
          weekly_limit_usd?: number;
          spent_this_week_usd6?: number;
          spent_this_week_usd?: number;
          attempted_charge_usd6?: number;
          attempted_charge_usd?: number;
          estimated_usd?: number;
          amount_display?: string;
          currency?: string;
          reason?: string;
        };
      };

      if (error.status === 400 && body?.code === "PRICE_EXCEEDS_MAX") {
        const offered =
          body.details?.offered_price_usd ??
          (typeof body.details?.offered_price_usd6 === "number" ? usd6ToUsd(body.details.offered_price_usd6) : 0);
        const max =
          body.details?.max_cost_usd ??
          (typeof body.details?.max_cost_usd6 === "number" ? usd6ToUsd(body.details.max_cost_usd6) : 0);
        const estimatedUsd = body.details?.estimated_usd;
        const amountDisplay = body.details?.amount_display;
        const currency = body.details?.currency ?? "USDC";

        console.error(
          `Price ${formatUsd(offered)} exceeds --max-cost ${formatUsd(max)}. Run without --max-cost or increase it.`,
        );

        if (amountDisplay) {
          console.error(
            `Offered token amount: ${amountDisplay} ${currency} (~${formatUsdEstimate(estimatedUsd, offered)})`,
          );
        }

        return;
      }

      if (error.status === 400 && body?.code === "PRICE_NOT_CONVERTIBLE") {
        console.error("Price could not be converted to 6-decimal USD units for policy checks.");
        const requirement = requirementFromErrorDetails(body.details);
        if (requirement) {
          console.error("Payment requirement:");
          console.error(formatPaymentRequirementDetails(requirement));
        }
        return;
      }

      if (error.status === 402 && body?.code === "WEEKLY_BUDGET_EXCEEDED") {
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

      if (error.status === 403 && body?.code === "BLOCKLISTED_DOMAIN") {
        const reason = body.details?.reason ? ` (${body.details.reason})` : "";
        console.error(`This domain is blocked by AgentSpend${reason}.`);
        return;
      }
    }

    throw error;
  }
}
