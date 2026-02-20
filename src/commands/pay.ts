import { ApiError, AgentspendApiClient } from "../lib/api.js";
import { requireApiKey } from "../lib/credentials.js";
import { formatJson, formatUsd, formatUsdEstimate, usd6ToUsd } from "../lib/output.js";

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
      console.log(
        `\nCharged: ${formatUsd(response.payment.charged_usd)} | Remaining: ${formatUsd(response.payment.remaining_budget_usd)}`,
      );
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
          domain?: string;
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

      if (error.status === 403 && body?.code === "DOMAIN_NOT_ALLOWLISTED") {
        console.error("This domain is not in your AgentSpend allowlist.");
        return;
      }
    }

    throw error;
  }
}
