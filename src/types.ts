export interface Credentials {
  api_key: string;
  created_at: string;
}

export interface UseRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface UsePaymentSummary {
  charged_usd6: number;
  charged_usd: number;
  charged_amount_minor: number | null;
  charged_amount_display: string | null;
  charged_currency: string;
  estimated_usd: number | null;
  remaining_budget_usd6: number;
  remaining_budget_usd: number;
  transaction_hash: string | null;
  paid_to: string | null;
  network: string | null;
  scheme: string | null;
  resource: string | null;
}

export interface UseCloudHttpResult {
  mode: "cloud_http_result";
  status: number;
  headers: Record<string, string>;
  body: unknown;
  payment: UsePaymentSummary | null;
}

export interface UseActionRequiredResult {
  mode: "action_required";
  code: string;
  message: string;
  configure_url?: string;
  details?: Record<string, unknown>;
}

export type UseResponse = UseCloudHttpResult | UseActionRequiredResult;

export interface UseCommandResult {
  status: number;
  body: unknown;
  payment: {
    charged_usd: number;
    remaining_budget_usd: number;
    transaction_hash: string | null;
    paid_to: string | null;
    charged_currency: string | null;
  } | null;
}

export interface StatusCharge {
  id: string;
  amount_usd6: number;
  amount_usd?: number;
  target_domain: string;
  target_url: string;
  target_status: number | null;
  created_at: string;
}

export interface StatusResponse {
  weekly_budget_usd6: number;
  weekly_budget_usd: number;
  spent_this_week_usd6: number;
  spent_this_week_usd: number;
  remaining_budget_usd6: number;
  remaining_budget_usd: number;
  recent_charges: StatusCharge[];
}

export type ConfigureClaimStatus = "ready_to_claim" | "claimed" | "expired";

export interface ConfigureStatusResponse {
  token: string;
  configure_url: string;
  claim_status: ConfigureClaimStatus;
  has_card_on_file: boolean;
  has_api_key: boolean;
  weekly_limit_usd6: number | null;
  weekly_limit_usd: number | null;
}

export interface ConfigureClaimResponse {
  status: "claimed";
  agent_id: string;
}

export interface SearchServiceSummary {
  id: string;
  slug: string;
  name: string;
  description: string;
  domain: string;
  skill_url: string | null;
}

export interface SearchResponse {
  query: string;
  services: SearchServiceSummary[];
}
