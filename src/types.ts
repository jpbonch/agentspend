export interface Credentials {
  api_key: string;
  created_at: string;
}

export interface SetupCreateResponse {
  setup_id: string;
  setup_url: string;
}

export interface SetupStatusResponse {
  status: "pending" | "ready" | "expired" | "claimed";
}

export interface SetupClaimResponse {
  status: "claimed";
  agent_id: string;
}

export interface PayRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  max_cost_usd?: number;
}

export interface PaymentRequirementInfo {
  price_usd6: number | null;
  price_usd: number | null;
  estimated_usd: number | null;
  currency: string;
  pay_to: string | null;
  amount_minor: number | null;
  amount_display: string | null;
  decimals: number | null;
  description: string | null;
  network: string | null;
  scheme: string | null;
  resource: string | null;
  max_timeout_seconds: number | null;
  mime_type: string | null;
  pricing_note: string | null;
}

export interface PayResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  payment: {
    charged_usd6: number;
    charged_usd: number;
    charged_amount_minor: number | null;
    charged_amount_display: string | null;
    charged_currency: string;
    estimated_usd: number | null;
    pricing_note: string | null;
    remaining_budget_usd6: number;
    remaining_budget_usd: number;
    transaction_hash: string | null;
    paid_to: string | null;
    network: string | null;
    scheme: string | null;
    resource: string | null;
  } | null;
  payment_requirement?: PaymentRequirementInfo | null;
}

export interface CheckRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export interface CheckResponse {
  free?: boolean;
  price_usd6?: number | null;
  price_usd?: number | null;
  estimated_usd?: number | null;
  currency?: string;
  pay_to?: string | null;
  amount_minor?: number | null;
  amount_display?: string | null;
  decimals?: number | null;
  description?: string | null;
  network?: string | null;
  scheme?: string | null;
  resource?: string | null;
  max_timeout_seconds?: number | null;
  mime_type?: string | null;
  pricing_note?: string | null;
  status?: number;
  payment_requirement?: PaymentRequirementInfo;
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

export interface ConfigureResponse {
  configure_url: string;
}

export interface ApiErrorBody {
  error?: string;
  code?: string;
  details?: unknown;
}
