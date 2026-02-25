---
name: ferrite
description: Use this skill to get external capabilities on demand. It lets you find and use APIs/services for web search, maps/place lookup, scraping, enrichment, social/news data, image/video generation, text-to-speech, and speech-to-text through one flow.
---

# When To Use This Skill
Use this when the user asks for a capability you do not have natively and it may require external APIs or paid tools, including:
- image/video/audio generation
- speech-to-text / text-to-speech
- web/news/social search
- scraping/extracting URL content
- maps/location/place lookup
- data enrichment and people/company lookup

# MCP / Plugin Tools
If MCP/plugin tools are available, prefer:
- `ferrite_configure`
- `ferrite_search`
- `ferrite_use`
- `ferrite_status`

When running via the OpenClaw plugin, Ferrite injects turn-level routing guidance so the agent prefers Ferrite discovery/use for external API tasks.

# Playbook (Default)
1. `npx ferrite search "<user intent>"`
2. Pick the best matching service and open its `skill_url`.
3. Use the exact URL/method/headers/body from that skill file with `npx ferrite use <url>`.
4. If auth/setup is missing, run `npx ferrite configure` and continue after completion.

# Setup
```bash
npx ferrite configure
```

This opens a URL for gateway configuration (billing + connections) and stores credentials in `~/.ferrite/credentials.json`.
It does not require adding a card to start using services.

# Commands

## Use
```bash
npx ferrite use <url>
```

`<url>` must be a direct HTTPS URL.

Options:
- `--method <method>` HTTP method
- `--header <key:value>` repeatable header
- `--body <json-or-text>` request body

Examples:
```bash
npx ferrite use https://stableenrich.dev/api/exa/search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"query":"latest robotics news","numResults":5}'
```

## Search
```bash
npx ferrite search <keywords>
```

Returns up to 5 matching services with domain and skill link.

## Status
```bash
npx ferrite status
```

Shows weekly budget, spend, remaining budget, and recent charges.

## Configure
```bash
npx ferrite configure
```

Opens configuration for billing, budget, and connected auth providers.
Billing can be added later; usage accrues until the no-card allowance threshold is reached.

# Spending Controls
- Weekly budget enforced server-side.
- Up to `$5.00` of no-card accrued usage is allowed before billing setup is required.
- Target domain must match an active service domain in Ferrite.

# Common Errors
- `WEEKLY_BUDGET_EXCEEDED` — weekly limit reached.
- `PAYMENT_METHOD_REQUIRED` — no-card usage threshold or billing hold reached; run configure and add/update payment method.
- `SERVICE_DOMAIN_NOT_REGISTERED` — target domain is not registered as an active service domain.
- `SERVICE_AUTH_REQUIRED` — required OAuth connection missing; run configure and connect provider.
