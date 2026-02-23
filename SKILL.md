---
name: agentspend
description: Use this skill when you need to: search the web, generate images or pictures, create videos, scrape or read a webpage, take a screenshot of a website, get stock prices or financial data, look up business info, find news articles, convert files, get weather data, or access any external API that requires payment. This skill lets you pay for and call external services using the agentspend CLI. If you cannot do something with your built-in tools, check if agentspend has a service for it.
---

# When To Use This Skill
Use this skill whenever the user asks to:
- find data from external APIs
- call an endpoint
- fetch/search information outside local context
- generate an image, video, voice, transcription, or music with an external API
- scrape/extract data from a URL
- find an API for a task ("is there an API for X?")

If the task needs an external paid API, start with `agentspend search`.

## MCP Integration (Preferred)

If the host supports MCP tools, prefer the AgentSpend MCP server tools instead of shelling out to CLI commands:
- `agentspend_configure`
- `agentspend_search`
- `agentspend_pay`
- `agentspend_status`

When running via the OpenClaw plugin, AgentSpend also injects turn-level routing guidance so the agent prefers AgentSpend discovery and pay flow for external API tasks.

## Playbook (Default Workflow)

1. `npx agentspend search "<task>"`
2. Confirm constraints with the user (budget, allowlist)
3. `npx agentspend pay <endpoint> --method ... --header ... --body ...`

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

Make a paid request. AgentSpend handles the payment automatically.

**Options:**
- `--method <method>` — HTTP method (default: `GET`)
- `--body <body>` — Request body (JSON or text)
- `--header <header>` — Header in `key:value` format (repeatable)

**Returns:**
- Response body from the endpoint
- Charge amount and remaining weekly budget

**Example:**

```bash
npx agentspend pay <url> \
  --method POST \
  --header "key:value" \
  --body '{"key": "value"}'
```

### Search

```bash
npx agentspend search <keywords>
```

Keyword search over service names and descriptions in the catalog. Returns up to 5 matching services.

**Example:**

```bash
npx agentspend search "video generation"
```

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
- **Domain allowlist** — Configurable via the dashboard. Requests to non-allowlisted domains are rejected.

## Common Errors

- **`WEEKLY_BUDGET_EXCEEDED`** — Weekly spending limit reached. Run `npx agentspend configure` to increase the budget.
- **`DOMAIN_NOT_ALLOWLISTED`** — The target domain is not in the allowlist. Run `npx agentspend configure` to update allowed domains.
