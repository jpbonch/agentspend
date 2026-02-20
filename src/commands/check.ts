import { ApiError, AgentspendApiClient } from "../lib/api.js";
import { requireApiKey } from "../lib/credentials.js";
import { formatUsd, usd6ToUsd } from "../lib/output.js";

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

    const policyUsd =
      response.price_usd ?? (typeof response.price_usd6 === "number" ? usd6ToUsd(response.price_usd6) : null);
    const price = policyUsd !== null ? formatUsd(policyUsd) : "unavailable";
    const description = response.description ?? "unavailable";
    console.log(`Price: ${price}`);
    console.log(`Description: ${description}`);

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
