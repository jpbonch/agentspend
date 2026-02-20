import type {
  CheckRequest,
  CheckResponse,
  ConfigureClaimResponse,
  ConfigureStatusResponse,
  ConfigureResponse,
  PayRequest,
  PayResponse,
  StatusResponse,
} from "../types.js";

const DEFAULT_API_URL = process.env.AGENTSPEND_API_URL ?? "https://api.agentspend.co";

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  return response.text();
}

function errorMessageFromBody(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
    return body.error;
  }

  if (typeof body === "string" && body.length > 0) {
    return body;
  }

  return fallback;
}

export class AgentspendApiClient {
  constructor(private readonly baseUrl = DEFAULT_API_URL) {}

  private async request<T>(path: string, init: RequestInit = {}, apiKey?: string): Promise<T> {
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> | undefined),
    };

    if (apiKey) {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    if (init.body && !headers["content-type"] && !headers["Content-Type"]) {
      headers["content-type"] = "application/json";
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    const body = await parseBody(response);

    if (!response.ok) {
      throw new ApiError(errorMessageFromBody(body, `Request failed (${response.status})`), response.status, body);
    }

    return body as T;
  }

  pay(apiKey: string, payload: PayRequest): Promise<PayResponse> {
    return this.request<PayResponse>("/v1/pay", {
      method: "POST",
      body: JSON.stringify(payload),
    }, apiKey);
  }

  check(apiKey: string, payload: CheckRequest): Promise<CheckResponse> {
    return this.request<CheckResponse>("/v1/check", {
      method: "POST",
      body: JSON.stringify(payload),
    }, apiKey);
  }

  status(apiKey: string): Promise<StatusResponse> {
    return this.request<StatusResponse>("/v1/status", {
      method: "GET",
    }, apiKey);
  }

  configure(payload?: { weekly_limit_usd?: number }, apiKey?: string): Promise<ConfigureResponse> {
    return this.request<ConfigureResponse>("/v1/configure", {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    }, apiKey);
  }

  configureStatus(token: string): Promise<ConfigureStatusResponse> {
    return this.request<ConfigureStatusResponse>(`/v1/configure/${encodeURIComponent(token)}/status`, {
      method: "GET",
    });
  }

  claimConfigure(token: string, apiKeyHash: string): Promise<ConfigureClaimResponse> {
    return this.request<ConfigureClaimResponse>(`/v1/configure/${encodeURIComponent(token)}/claim`, {
      method: "POST",
      body: JSON.stringify({ api_key_hash: apiKeyHash }),
    });
  }
}
