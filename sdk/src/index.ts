import type { ChargeRequest, ChargeResponse, ErrorResponse } from "@agentspend/types";

export type { ChargeRequest, ChargeResponse, ErrorResponse } from "@agentspend/types";

export interface AgentSpendOptions {
  /**
   * Base URL for the AgentSpend Platform API.
   *
   * If omitted, the SDK will use `process.env.AGENTSPEND_API_URL` when available,
   * otherwise it falls back to the hosted default.
   */
  platformApiBaseUrl?: string;
  serviceApiKey: string;
  fetchImpl?: typeof fetch;
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

export interface HonoContextLike {
  req: {
    header(name: string): string | undefined;
    json(): Promise<unknown>;
  };
  json(body: unknown, status?: number): unknown;
}

export interface PaywallOptions {
  currency?: string;
  description?: string;
  metadata?: (body: unknown) => Record<string, unknown>;
}

export interface AgentSpend {
  charge(walletId: string, opts: ChargeOptions): Promise<ChargeResponse>;
  paywall(amountCents: number, opts?: PaywallOptions): (c: HonoContextLike, next: () => Promise<void>) => Promise<unknown>;
}

export function createAgentSpend(options: AgentSpendOptions): AgentSpend {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new AgentSpendChargeError("No fetch implementation available", 500);
  }

  const platformApiBaseUrl = resolvePlatformApiBaseUrl(options.platformApiBaseUrl);

  async function charge(walletIdInput: string, opts: ChargeOptions): Promise<ChargeResponse> {
    const walletId = toWalletId(walletIdInput);
    if (!walletId) {
      throw new AgentSpendChargeError("wallet_id must start with wal_", 400);
    }
    if (!Number.isInteger(opts.amount_cents) || opts.amount_cents <= 0) {
      throw new AgentSpendChargeError("amount_cents must be a positive integer", 400);
    }

    const payload: ChargeRequest = {
      wallet_id: walletId,
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

    const responseBody = (await response.json().catch(() => ({}))) as Partial<ChargeResponse> & Partial<ErrorResponse> & Record<string, unknown>;
    if (!response.ok) {
      throw new AgentSpendChargeError(
        typeof responseBody.error === "string" ? responseBody.error : "AgentSpend charge failed",
        response.status,
        responseBody
      );
    }

    return responseBody as ChargeResponse;
  }

  function paywall(amountCents: number, opts?: PaywallOptions) {
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new AgentSpendChargeError("amountCents must be a positive integer", 500);
    }

    return async function paywallMiddleware(c: HonoContextLike, next: () => Promise<void>) {
      const walletIdFromHeader = c.req.header("x-wallet-id");

      let body: unknown = null;
      let walletId = walletIdFromHeader ? toWalletId(walletIdFromHeader) : null;
      if (!walletId || opts?.metadata) {
        body = await c.req.json().catch(() => ({}));

        if (!walletId) {
          const bodyWalletId = typeof (body as { wallet_id?: unknown })?.wallet_id === "string" ? (body as any).wallet_id : null;
          walletId = toWalletId(bodyWalletId);
        }
      }

      if (!walletId) {
        return c.json({ error: "wallet_id is required (x-wallet-id header or JSON body wallet_id)" }, 400);
      }

      try {
        await charge(walletId, {
          amount_cents: amountCents,
          currency: opts?.currency ?? "usd",
          description: opts?.description,
          metadata: opts?.metadata ? toStringMetadata(opts.metadata(body)) : undefined,
          idempotency_key: c.req.header("x-request-id") ?? c.req.header("idempotency-key") ?? undefined
        });
      } catch (error) {
        if (error instanceof AgentSpendChargeError) {
          if (error.statusCode === 402) {
            return c.json({ error: "Payment required", details: error.details }, 402);
          }
          return c.json({ error: error.message, details: error.details }, error.statusCode);
        }
        return c.json({ error: "Unexpected paywall failure" }, 500);
      }

      await next();
    };
  }

  return {
    charge,
    paywall
  };
}

function toWalletId(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }
  const trimmed = input.trim();
  if (!trimmed.startsWith("wal_")) {
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
