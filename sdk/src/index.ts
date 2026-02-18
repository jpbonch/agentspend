// ---------------------------------------------------------------------------
// Types (inlined from @agentspend/types to avoid cross-repo publish)
// ---------------------------------------------------------------------------

export interface ChargeRequest {
  card_id: string;
  amount_cents: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
  idempotency_key?: string;
}

export interface ChargeResponse {
  charged: true;
  card_id: string;
  amount_cents: number;
  currency: string;
  remaining_limit_cents: number;
  stripe_payment_intent_id: string;
  stripe_charge_id: string;
  charge_attempt_id: string;
}

export interface ErrorResponse {
  error: string;
}

export type PaymentMethod = "card" | "crypto";

export interface PaywallPaymentContext {
  method: PaymentMethod;
  amount_cents: number;
  currency: string;
  card_id?: string;
  remaining_limit_cents?: number;
  transaction_hash?: string;
  payer_address?: string;
  network?: string;
}

// ---------------------------------------------------------------------------
// x402 imports – server-side only (HTTP calls to facilitator, no crypto deps)
// ---------------------------------------------------------------------------
import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import type {
  PaymentRequirements,
  PaymentPayload,
  VerifyResponse,
  SettleResponse,
  Network
} from "@x402/core/types";

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface AgentSpendOptions {
  /**
   * Base URL for the AgentSpend Platform API.
   *
   * If omitted, the SDK will use `process.env.AGENTSPEND_API_URL` when available,
   * otherwise it falls back to the hosted default.
   */
  platformApiBaseUrl?: string;
  /** Service API key. Optional — crypto-only services don't need one. */
  serviceApiKey?: string;
  fetchImpl?: typeof fetch;
  /** Crypto / x402 configuration. */
  crypto?: {
    /** Static payTo address for crypto-only services. */
    receiverAddress?: string;
    /** Chain identifier. Default: "eip155:8453" (Base). */
    network?: string;
    /** x402 facilitator URL. Default: "https://x402.org/facilitator". */
    facilitatorUrl?: string;
  };
}

export interface ChargeOptions {
  amount_cents: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
  idempotency_key?: string;
}

export class AgentSpendChargeError extends Error {
  statusCode: number;
  details: unknown;

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// ---------------------------------------------------------------------------
// Context abstraction (Hono-compatible)
// ---------------------------------------------------------------------------

export interface HonoContextLike {
  req: {
    header(name: string): string | undefined;
    json(): Promise<unknown>;
    url: string;
    method: string;
  };
  json(body: unknown, status?: number): Response;
  header(name: string, value: string): void;
  set(key: string, value: unknown): void;
  get(key: string): unknown;
}

// ---------------------------------------------------------------------------
// Paywall options
// ---------------------------------------------------------------------------

export interface PaywallOptions {
  /**
   * Amount in cents.
   * - number: fixed price (e.g. 500 = $5.00)
   * - string: body field name to read amount from (e.g. "amount_cents")
   * - function: custom dynamic pricing (body: unknown) => number
   */
  amount: number | string | ((body: unknown) => number);
  currency?: string;
  description?: string;
  metadata?: (body: unknown) => Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Payment context helper
// ---------------------------------------------------------------------------

const PAYMENT_CONTEXT_KEY = "payment";

export function getPaymentContext(c: HonoContextLike): PaywallPaymentContext | null {
  const ctx = c.get(PAYMENT_CONTEXT_KEY);
  return (ctx as PaywallPaymentContext) ?? null;
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface AgentSpend {
  charge(cardId: string, opts: ChargeOptions): Promise<ChargeResponse>;
  paywall(opts: PaywallOptions): (c: HonoContextLike, next: () => Promise<void>) => Promise<Response | void>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createAgentSpend(options: AgentSpendOptions): AgentSpend {
  // Validate: at least one of serviceApiKey or crypto must be provided
  if (!options.serviceApiKey && !options.crypto) {
    throw new AgentSpendChargeError(
      "At least one of serviceApiKey or crypto config must be provided",
      500
    );
  }

  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new AgentSpendChargeError("No fetch implementation available", 500);
  }

  const platformApiBaseUrl = resolvePlatformApiBaseUrl(options.platformApiBaseUrl);

  // -------------------------------------------------------------------
  // Lazy service_id fetch + cache
  // -------------------------------------------------------------------
  let cachedServiceId: string | null = null;

  async function getServiceId(): Promise<string | null> {
    if (cachedServiceId) return cachedServiceId;
    if (!options.serviceApiKey) return null;
    try {
      const res = await fetchImpl(joinUrl(platformApiBaseUrl, "/v1/service/me"), {
        headers: { authorization: `Bearer ${options.serviceApiKey}` }
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        cachedServiceId = data.id ?? null;
      }
    } catch { /* graceful fallback */ }
    return cachedServiceId;
  }

  // -------------------------------------------------------------------
  // x402 singleton setup (Decision 9)
  // Server-side: facilitator handles verify + settle over HTTP.
  // No client-side EVM scheme needed — we delegate to the facilitator.
  // -------------------------------------------------------------------
  let facilitator: HTTPFacilitatorClient | null = null;
  let resourceServer: x402ResourceServer | null = null;
  const cryptoNetwork: Network = (options.crypto?.network ?? "eip155:8453") as Network;

  if (options.crypto || options.serviceApiKey) {
    const facilitatorUrl =
      options.crypto?.facilitatorUrl ?? "https://x402.org/facilitator";
    facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl });
    resourceServer = new x402ResourceServer(facilitator);
  }

  // -------------------------------------------------------------------
  // charge() — card-only, unchanged
  // -------------------------------------------------------------------

  async function charge(cardIdInput: string, opts: ChargeOptions): Promise<ChargeResponse> {
    if (!options.serviceApiKey) {
      throw new AgentSpendChargeError("charge() requires serviceApiKey", 500);
    }

    const cardId = toCardId(cardIdInput);
    if (!cardId) {
      throw new AgentSpendChargeError("card_id must start with card_", 400);
    }
    if (!Number.isInteger(opts.amount_cents) || opts.amount_cents <= 0) {
      throw new AgentSpendChargeError("amount_cents must be a positive integer", 400);
    }

    const payload: ChargeRequest = {
      card_id: cardId,
      amount_cents: opts.amount_cents,
      currency: opts.currency ?? "usd",
      ...(opts.description ? { description: opts.description } : {}),
      ...(opts.metadata ? { metadata: opts.metadata } : {}),
      idempotency_key: opts.idempotency_key ?? bestEffortIdempotencyKey()
    };

    const response = await fetchImpl(joinUrl(platformApiBaseUrl, "/v1/charge"), {
      method: "POST",
      headers: {
        authorization: `Bearer ${options.serviceApiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseBody = (await response.json().catch(() => ({}))) as Partial<ChargeResponse> &
      Partial<ErrorResponse> &
      Record<string, unknown>;
    if (!response.ok) {
      throw new AgentSpendChargeError(
        typeof responseBody.error === "string" ? responseBody.error : "AgentSpend charge failed",
        response.status,
        responseBody
      );
    }

    return responseBody as ChargeResponse;
  }

  // -------------------------------------------------------------------
  // paywall() — unified card + crypto middleware
  // -------------------------------------------------------------------

  function paywall(opts: PaywallOptions) {
    const { amount } = opts;

    // Validate fixed-price amount at creation time
    if (typeof amount === "number") {
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new AgentSpendChargeError("amount must be a positive integer", 500);
      }
    }

    return async function paywallMiddleware(
      c: HonoContextLike,
      next: () => Promise<void>
    ): Promise<Response | void> {
      // Step 1: Parse body once (Decision 11)
      const body: unknown = await c.req.json().catch(() => ({}));

      // Step 2: Determine effective amount
      let effectiveAmount: number;
      if (typeof amount === "number") {
        effectiveAmount = amount;
      } else if (typeof amount === "string") {
        const raw = (body as Record<string, unknown>)?.[amount];
        effectiveAmount = typeof raw === "number" ? raw : 0;
      } else {
        effectiveAmount = amount(body);
      }

      if (!Number.isInteger(effectiveAmount) || effectiveAmount <= 0) {
        return c.json({ error: "Could not determine payment amount from request" }, 400);
      }

      const currency = opts.currency ?? "usd";

      // Step 3: Check for payment header → crypto payment
      // x402 v2 uses "Payment-Signature", v1 uses "X-Payment"
      const paymentHeader = c.req.header("payment-signature") ?? c.req.header("x-payment");
      if (paymentHeader) {
        return handleCryptoPayment(c, next, paymentHeader, effectiveAmount, currency, body, opts);
      }

      // Step 4: Check for x-card-id header or body.card_id → card payment
      const cardIdFromHeader = c.req.header("x-card-id");
      let cardId = cardIdFromHeader ? toCardId(cardIdFromHeader) : null;
      if (!cardId) {
        const bodyCardId =
          typeof (body as { card_id?: unknown })?.card_id === "string"
            ? (body as { card_id: string }).card_id
            : null;
        cardId = toCardId(bodyCardId);
      }

      if (cardId) {
        return handleCardPayment(c, next, cardId, effectiveAmount, currency, body, opts);
      }

      // Step 5: Neither → return 402 with Payment-Required header (Decision 8)
      return return402Response(c, effectiveAmount, currency);
    };
  }

  // -------------------------------------------------------------------
  // handleCardPayment — existing charge() flow
  // -------------------------------------------------------------------

  async function handleCardPayment(
    c: HonoContextLike,
    next: () => Promise<void>,
    cardId: string,
    amountCents: number,
    currency: string,
    body: unknown,
    opts: PaywallOptions
  ): Promise<Response | void> {
    if (!options.serviceApiKey) {
      return c.json({ error: "Card payments require serviceApiKey" }, 500);
    }

    try {
      const chargeResult = await charge(cardId, {
        amount_cents: amountCents,
        currency,
        description: opts.description,
        metadata: opts.metadata ? toStringMetadata(opts.metadata(body)) : undefined,
        idempotency_key:
          c.req.header("x-request-id") ?? c.req.header("idempotency-key") ?? undefined
      });

      const paymentContext: PaywallPaymentContext = {
        method: "card",
        amount_cents: amountCents,
        currency,
        card_id: cardId,
        remaining_limit_cents: chargeResult.remaining_limit_cents
      };
      c.set(PAYMENT_CONTEXT_KEY, paymentContext);
    } catch (error) {
      if (error instanceof AgentSpendChargeError) {
        if (error.statusCode === 403) {
          // No binding — return 402 so agent can discover service_id and bind
          return return402Response(c, amountCents, currency);
        }
        if (error.statusCode === 402) {
          return c.json({ error: "Payment required", details: error.details }, 402);
        }
        return c.json({ error: error.message, details: error.details }, error.statusCode);
      }
      return c.json({ error: "Unexpected paywall failure" }, 500);
    }

    await next();
  }

  // -------------------------------------------------------------------
  // handleCryptoPayment — x402 verify + settle via facilitator
  // -------------------------------------------------------------------

  async function handleCryptoPayment(
    c: HonoContextLike,
    next: () => Promise<void>,
    paymentHeader: string,
    amountCents: number,
    currency: string,
    _body: unknown,
    _opts: PaywallOptions
  ): Promise<Response | void> {
    if (!facilitator) {
      return c.json({ error: "Crypto payments not configured" }, 500);
    }

    try {
      // Decode the x-payment header (base64 JSON payment payload)
      let paymentPayload: PaymentPayload;
      try {
        paymentPayload = JSON.parse(
          Buffer.from(paymentHeader, "base64").toString("utf-8")
        ) as PaymentPayload;
      } catch {
        return c.json({ error: "Invalid payment payload encoding" }, 400);
      }

      // Extract payTo from the payment payload's accepted requirements
      // rather than generating a new deposit address.
      // resolvePayToAddress() creates a fresh Stripe PaymentIntent each
      // time, which would return a *different* address than the one in the
      // 402 response the client signed against → facilitator verification
      // would fail.
      const acceptedPayTo = (paymentPayload as unknown as { accepted?: { payTo?: string } })
        .accepted?.payTo;
      const payTo: string = acceptedPayTo ?? await resolvePayToAddress();

      // Build the payment requirements that the payment should satisfy
      const paymentRequirements: PaymentRequirements = {
        scheme: "exact",
        network: cryptoNetwork,
        amount: String(amountCents),
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
        payTo,
        maxTimeoutSeconds: 300,
        extra: { name: "USD Coin", version: "2" }
      };

      // Verify payment via facilitator
      const verifyResult: VerifyResponse = await facilitator.verify(
        paymentPayload,
        paymentRequirements
      );

      if (!verifyResult.isValid) {
        return c.json(
          { error: "Payment verification failed", details: verifyResult.invalidReason },
          402
        );
      }

      // Settle payment via facilitator
      const settleResult: SettleResponse = await facilitator.settle(
        paymentPayload,
        paymentRequirements
      );

      if (!settleResult.success) {
        return c.json(
          { error: "Payment settlement failed", details: settleResult.errorReason },
          402
        );
      }

      const paymentContext: PaywallPaymentContext = {
        method: "crypto",
        amount_cents: amountCents,
        currency,
        transaction_hash: settleResult.transaction,
        payer_address: verifyResult.payer ?? undefined,
        network: cryptoNetwork
      };
      c.set(PAYMENT_CONTEXT_KEY, paymentContext);

      await next();
    } catch (error) {
      if (error instanceof AgentSpendChargeError) {
        return c.json({ error: error.message, details: error.details }, error.statusCode);
      }
      return c.json(
        { error: "Crypto payment processing failed", details: (error as Error).message },
        500
      );
    }
  }

  // -------------------------------------------------------------------
  // return402Response — x402 Payment-Required format (Decision 8)
  // -------------------------------------------------------------------

  async function return402Response(
    c: HonoContextLike,
    amountCents: number,
    currency: string
  ): Promise<Response> {
    const serviceId = await getServiceId();

    try {
      const payTo = await resolvePayToAddress();

      const paymentRequirements: PaymentRequirements = {
        scheme: "exact",
        network: cryptoNetwork,
        amount: String(amountCents),
        asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
        payTo,
        maxTimeoutSeconds: 300,
        extra: { name: "USD Coin", version: "2" }
      };

      // Build x402 v2 PaymentRequired response
      const paymentRequired = {
        x402Version: 2,
        error: "Payment required",
        resource: {
          url: c.req.url,
          description: `Payment of ${amountCents} cents`,
          mimeType: "application/json"
        },
        accepts: [paymentRequirements]
      };

      // Set Payment-Required header (base64 encoded)
      const headerValue = Buffer.from(
        JSON.stringify(paymentRequired)
      ).toString("base64");
      c.header("Payment-Required", headerValue);

      return c.json({
        error: "Payment required",
        amount_cents: amountCents,
        currency,
        ...(serviceId ? {
          agentspend: {
            service_id: serviceId,
            amount_cents: amountCents,
          }
        } : {})
      }, 402);
    } catch (error) {
      // Log clearly so service developers can diagnose why crypto is unavailable
      console.error(
        "[agentspend] Failed to resolve crypto payTo address — returning card-only 402:",
        error instanceof Error ? error.message : error
      );
      // Return card-only 402 (no Payment-Required header → crypto clients
      // will see "Invalid payment required response")
      return c.json(
        {
          error: "Payment required",
          amount_cents: amountCents,
          currency,
          ...(serviceId ? {
            agentspend: {
              service_id: serviceId,
              amount_cents: amountCents,
            }
          } : {})
        },
        402
      );
    }
  }

  // -------------------------------------------------------------------
  // resolvePayToAddress — static address or Stripe Machine Payments
  // -------------------------------------------------------------------

  async function resolvePayToAddress(): Promise<string> {
    // Static address for crypto-only services
    if (options.crypto?.receiverAddress) {
      return options.crypto.receiverAddress;
    }

    // Stripe Connect service → get deposit address from platform
    if (options.serviceApiKey) {
      const response = await fetchImpl(
        joinUrl(platformApiBaseUrl, "/v1/crypto/deposit-address"),
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${options.serviceApiKey}`,
            "content-type": "application/json"
          },
          body: JSON.stringify({ amount_cents: 0, currency: "usd" })
        }
      );

      if (!response.ok) {
        throw new AgentSpendChargeError("Failed to resolve crypto deposit address", 502);
      }

      const data = (await response.json()) as { deposit_address?: string };
      if (!data.deposit_address) {
        throw new AgentSpendChargeError("No deposit address returned", 502);
      }
      return data.deposit_address;
    }

    throw new AgentSpendChargeError("No crypto payTo address available", 500);
  }

  // -------------------------------------------------------------------
  // Return public interface
  // -------------------------------------------------------------------

  return {
    charge,
    paywall
  };
}

// ---------------------------------------------------------------------------
// Helpers (unchanged from original)
// ---------------------------------------------------------------------------

function toCardId(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }
  const trimmed = input.trim();
  if (!trimmed.startsWith("card_")) {
    return null;
  }
  return trimmed;
}

function joinUrl(base: string, path: string): string {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function bestEffortIdempotencyKey(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) {
    return uuid;
  }
  return `auto_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function toStringMetadata(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (typeof value === "string") {
      result[key] = value;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      result[key] = String(value);
    } else if (typeof value === "boolean") {
      result[key] = value ? "true" : "false";
    }
  }
  return result;
}

const DEFAULT_PLATFORM_API_BASE_URL = "https://api.agentspend.co";

function resolvePlatformApiBaseUrl(explicitBaseUrl: string | undefined): string {
  if (explicitBaseUrl && explicitBaseUrl.trim().length > 0) {
    return explicitBaseUrl.trim();
  }

  const envValue =
    typeof process !== "undefined" && process.env ? process.env.AGENTSPEND_API_URL : undefined;

  if (typeof envValue === "string" && envValue.trim().length > 0) {
    return envValue.trim();
  }

  return DEFAULT_PLATFORM_API_BASE_URL;
}
