export type WalletSetupStatus = "awaiting_card" | "ready" | "expired" | "failed";

export interface WalletCreateRequest {
  monthly_limit_cents?: number;
}

export interface WalletCreateResponse {
  setup_id: string;
  setup_url: string;
  status: WalletSetupStatus;
  expires_at: string;
}

export interface WalletSetupStatusResponse {
  setup_id: string;
  status: WalletSetupStatus;
  expires_at: string;
  wallet_id?: string;
}

export interface ChargeRequest {
  wallet_id: string;
  amount_cents: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
  idempotency_key?: string;
}

export interface ChargeResponse {
  charged: true;
  wallet_id: string;
  amount_cents: number;
  currency: string;
  remaining_limit_cents: number;
  stripe_payment_intent_id: string;
  stripe_charge_id: string;
  charge_attempt_id: string;
}

export interface AuthorizationResponse {
  authorized: boolean;
  remaining_limit_cents: number;
}

export interface ErrorResponse {
  error: string;
}
