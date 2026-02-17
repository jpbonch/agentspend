import { Command } from "commander";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".agentspend");
const CARD_FILE = join(CONFIG_DIR, "card.json");
const WALLET_FILE = join(CONFIG_DIR, "wallet.json");
const API_BASE = process.env.AGENTSPEND_API_URL ?? "https://api.agentspend.co";

interface CardConfig {
  card_id: string;
  card_secret: string;
}

interface WalletConfig {
  address: string;
  network: string;
  private_key: string;
}

async function readCardConfig(): Promise<CardConfig | null> {
  try {
    const data = JSON.parse(await readFile(CARD_FILE, "utf-8"));
    if (typeof data.card_id === "string" && data.card_id && typeof data.card_secret === "string" && data.card_secret) {
      return data as CardConfig;
    }
  } catch {
    // file doesn't exist or is invalid
  }
  return null;
}

async function readWalletConfig(): Promise<WalletConfig | null> {
  try {
    const data = JSON.parse(await readFile(WALLET_FILE, "utf-8"));
    if (typeof data.address === "string" && data.address) {
      return data as WalletConfig;
    }
  } catch {
    // file doesn't exist or is invalid
  }
  return null;
}

function parseHeaders(headerArgs: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const h of headerArgs) {
    const idx = h.indexOf(":");
    if (idx === -1) {
      throw new Error(`Invalid header format: "${h}". Use key:value`);
    }
    headers[h.slice(0, idx).trim()] = h.slice(idx + 1).trim();
  }
  return headers;
}

async function payWithCard(
  url: string,
  cardConfig: CardConfig,
  body: string | undefined,
  extraHeaders: Record<string, string>
): Promise<void> {
  const headers: Record<string, string> = {
    ...extraHeaders,
    "x-card-id": cardConfig.card_id,
  };
  if (body) {
    headers["content-type"] = "application/json";
  }

  // Try with x-card-id
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: body ?? undefined,
  });

  // Success
  if (res.ok) {
    console.log("Payment successful (card)");
    const data = await res.text();
    try { console.log(JSON.stringify(JSON.parse(data), null, 2)); }
    catch { console.log(data); }
    return;
  }

  // 402 with agentspend.service_id — need to bind
  if (res.status === 402) {
    const errorBody = await res.json().catch(() => ({})) as Record<string, unknown>;
    const agentspend = errorBody?.agentspend as Record<string, unknown> | undefined;
    const serviceId = agentspend?.service_id as string | undefined;

    if (serviceId) {
      console.log(`Binding to service ${serviceId}...`);
      const bindRes = await fetch(
        `${API_BASE}/v1/card/${encodeURIComponent(cardConfig.card_id)}/bind`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            card_secret: cardConfig.card_secret,
            service_id: serviceId,
          }),
        }
      );

      if (!bindRes.ok) {
        const bindError = await bindRes.text();
        console.error(`Failed to bind (${bindRes.status}): ${bindError}`);
        process.exit(1);
      }

      console.log("Bound. Retrying payment...");

      // Retry with x-card-id
      const retryRes = await fetch(url, { method: "POST", headers, body: body ?? undefined });
      if (!retryRes.ok) {
        console.error(`Retry failed (${retryRes.status}): ${await retryRes.text()}`);
        process.exit(1);
      }

      console.log("Payment successful (card)");
      const data = await retryRes.text();
      try { console.log(JSON.stringify(JSON.parse(data), null, 2)); }
      catch { console.log(data); }
      return;
    }
  }

  // Other error
  console.error(`Request failed (${res.status}): ${await res.text().catch(() => "")}`);
  process.exit(1);
}

async function payWithCrypto(
  url: string,
  walletConfig: WalletConfig,
  body: string | undefined,
  extraHeaders: Record<string, string>
): Promise<void> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (body) {
    headers["content-type"] = "application/json";
  }

  // First request — expect 402
  const initialRes = await fetch(url, {
    method: "POST",
    headers,
    body: body ?? undefined,
  });

  if (initialRes.status !== 402) {
    if (initialRes.ok) {
      console.log("Request succeeded without payment.");
      const data = await initialRes.text();
      try {
        console.log(JSON.stringify(JSON.parse(data), null, 2));
      } catch {
        console.log(data);
      }
      return;
    }
    const data = await initialRes.text();
    console.error(`Expected 402 but got ${initialRes.status}: ${data}`);
    process.exit(1);
  }

  // Import x402 and viem dynamically
  const { x402Client } = await import("@x402/core/client");
  const { x402HTTPClient } = await import("@x402/core/http");
  const { registerExactEvmScheme } = await import("@x402/evm/exact/client");
  const { privateKeyToAccount } = await import("viem/accounts");

  const account = privateKeyToAccount(walletConfig.private_key as `0x${string}`);

  const coreClient = new x402Client();
  registerExactEvmScheme(coreClient, { signer: account });
  const httpClient = new x402HTTPClient(coreClient);

  // Decode payment requirements from 402 response
  const paymentRequired = httpClient.getPaymentRequiredResponse(
    (name: string) => initialRes.headers.get(name),
    await initialRes.clone().json().catch(() => undefined)
  );

  // Sign payment
  const paymentPayload = await httpClient.createPaymentPayload(paymentRequired);
  const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);

  // Resend with payment header
  const paidRes = await fetch(url, {
    method: "POST",
    headers: { ...headers, ...paymentHeaders },
    body: body ?? undefined,
  });

  const data = await paidRes.text();
  if (!paidRes.ok) {
    console.error(`Paid request failed (${paidRes.status}): ${data}`);
    process.exit(1);
  }

  console.log("Payment successful (crypto)");
  try {
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  } catch {
    console.log(data);
  }
}

export function registerPayCommand(program: Command): void {
  program
    .command("pay")
    .description("Pay a paywall-protected endpoint using card or crypto wallet")
    .argument("<url>", "URL of the paywall-protected endpoint")
    .option("--method <method>", "Payment method: card or crypto (default: auto-detect)")
    .option("--body <json>", "Request body JSON")
    .option("--header <key:value>", "Extra headers (repeatable)", (val: string, prev: string[]) => {
      prev.push(val);
      return prev;
    }, [] as string[])
    .action(async (url: string, opts: { method?: string; body?: string; header: string[] }) => {
      try {
        const extraHeaders = parseHeaders(opts.header);

        if (opts.method === "card") {
          const card = await readCardConfig();
          if (!card) {
            console.error("No card configured. Run: agentspend card setup");
            process.exit(1);
          }
          await payWithCard(url, card, opts.body, extraHeaders);
          return;
        }

        if (opts.method === "crypto") {
          const wallet = await readWalletConfig();
          if (!wallet) {
            console.error("No wallet configured. Run: agentspend wallet create");
            process.exit(1);
          }
          await payWithCrypto(url, wallet, opts.body, extraHeaders);
          return;
        }

        // Auto-detect: try card first, then crypto
        const card = await readCardConfig();
        if (card) {
          await payWithCard(url, card, opts.body, extraHeaders);
          return;
        }

        const wallet = await readWalletConfig();
        if (wallet) {
          await payWithCrypto(url, wallet, opts.body, extraHeaders);
          return;
        }

        console.error("No payment method configured.");
        console.error("Set up a card:   agentspend card setup");
        console.error("Or create a wallet: agentspend wallet create");
        process.exit(1);
      } catch (err: unknown) {
        console.error(`Error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });
}
