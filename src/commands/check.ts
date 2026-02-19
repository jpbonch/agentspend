import { ApiError, AgentspendApiClient } from "../lib/api.js";
import { requireApiKey } from "../lib/credentials.js";
import { formatPaymentRequirementDetails, formatUsd, usd6ToUsd } from "../lib/output.js";
import type { CheckResponse, PaymentRequirementInfo } from "../types.js";

function requirementFromCheck(response: CheckResponse): PaymentRequirementInfo | null {
  if (response.payment_requirement) {
    return response.payment_requirement;
  }

  if (!response.currency) {
    return null;
  }

  return {
    price_usd6: response.price_usd6 ?? null,
    price_usd: response.price_usd ?? null,
    estimated_usd: response.estimated_usd ?? null,
    currency: response.currency,
    pay_to: response.pay_to ?? null,
    amount_minor: response.amount_minor ?? null,
    amount_display: response.amount_display ?? null,
    decimals: response.decimals ?? null,
    description: response.description ?? null,
    network: response.network ?? null,
    scheme: response.scheme ?? null,
    resource: response.resource ?? null,
    max_timeout_seconds: response.max_timeout_seconds ?? null,
    mime_type: response.mime_type ?? null,
    pricing_note: response.pricing_note ?? null,
  };
}

export async function runCheck(apiClient: AgentspendApiClient, url: string): Promise<void> {
  const apiKey = await requireApiKey();

  try {
    const response = await apiClient.check(apiKey, { url });

    if (response.free) {
      if ((response.status ?? 200) >= 400) {
        console.log(`No payment required, but endpoint returned status ${response.status}.`);
        return;
      }

      console.log("This endpoint is free.");
      return;
    }

    const requirement = requirementFromCheck(response);
    if (!requirement) {
      const fallbackUsd = response.price_usd ?? (response.price_usd6 !== null && response.price_usd6 !== undefined ? usd6ToUsd(response.price_usd6) : 0);
      console.log(`This endpoint charges ${formatUsd(fallbackUsd)} (${response.currency ?? "USDC"})`);
      return;
    }

    console.log("Payment requirement:");
    console.log(formatPaymentRequirementDetails(requirement));

    if (requirement.price_usd6 === null) {
      console.log("");
      console.log("Price could not be safely converted into 6-decimal USD units for policy checks.");
    }

    return;
  } catch (error) {
    if (error instanceof ApiError) {
      const body = error.body as { code?: string; details?: { header_names?: string[] } };
      if (error.status === 502 && body?.code === "UNSUPPORTED_PAYMENT_REQUIRED_FORMAT") {
        const headers = (body.details?.header_names ?? []).join(", ");
        console.error(
          `Endpoint returned 402 with an unsupported payment format. Headers seen: ${headers || "none"}.`,
        );
        return;
      }
    }

    throw error;
  }
}
