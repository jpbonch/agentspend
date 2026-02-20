---
name: agentspend
description: Make paid API requests on behalf of AI agents using a credit card.
---

## Setup

```bash
npx agentspend configure
```

Opens a URL to add a credit card and set a weekly spending limit. Saves credentials to `~/.agentspend/credentials.json`.

If already configured, re-running opens the dashboard to update settings.

## Commands

### Pay

```bash
npx agentspend pay <url>
```

Make a paid request. AgentSpend handles the payment automatically. Works with endpoints that support x402 (HTTP 402-based payment protocol for APIs).

**Options:**
- `--method <method>` — HTTP method (default: `GET`)
- `--body <body>` — Request body (JSON or text)
- `--header <header>` — Header in `key:value` format (repeatable)
- `--max-cost <usd>` — Maximum acceptable charge in USD (up to 6 decimal places)

**Returns:**
- Response body from the endpoint
- Charge amount and remaining weekly budget

**Example:**

```bash
npx agentspend pay <url> \
  --method POST \
  --header "key:value" \
  --body '{"key": "value"}' \
  --max-cost 0.05
```

### Check

```bash
npx agentspend check <url>
```

Discover an endpoint's price without paying.

**Example:**

```bash
npx agentspend check <url>
```

**Returns:**
- Price in USD
- Description (if available)

### Status

```bash
npx agentspend status
```

Show account spending overview.

**Returns:**
- Weekly budget
- Amount spent this week
- Remaining budget
- Recent charges with amounts, domains, and timestamps

### Configure

```bash
npx agentspend configure
```

Run onboarding or open the dashboard to update settings (weekly budget, domain allowlist, payment method).

## Spending Controls

- **Weekly budget** — Set during configure. Requests that would exceed the budget are rejected.
- **Per-request max cost** — Use `--max-cost` on `pay` to reject requests above a price threshold.
- **Domain allowlist** — Configurable via the dashboard. Requests to non-allowlisted domains are rejected.

## Common Errors

- **`WEEKLY_BUDGET_EXCEEDED`** — Weekly spending limit reached. Run `npx agentspend configure` to increase the budget.
- **`DOMAIN_NOT_ALLOWLISTED`** — The target domain is not in the allowlist. Run `npx agentspend configure` to update allowed domains.
- **`PRICE_EXCEEDS_MAX`** — Endpoint price is higher than `--max-cost`. Increase the value or remove the flag.
- **`UNSUPPORTED_PAYMENT_REQUIRED_FORMAT`** — The endpoint returned a 402 response but doesn't use the x402 format AgentSpend supports.
