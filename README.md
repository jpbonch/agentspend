# ferrite

Ferrite gives agents one gateway for discovering and calling external APIs without hardcoding provider-specific auth and billing logic. It packages the same flow as a CLI and an OpenClaw plugin so an agent can find the right service, call it, and handle setup/payment requirements consistently.
In practice, this enables an agent to add capabilities like web/news search, scraping, maps/place lookup, CRM/workspace integrations, enrichment, and media generation through one consistent toolchain.

Website: [useferrite.com](https://useferrite.com)

## How Ferrite works (general flow)

1. The agent starts with `search` to find matching services for a task.
2. Ferrite returns service metadata, including a `skill_url` with request shape and usage notes.
3. The agent calls `use` with the exact URL/method/headers/body for that service.
4. Ferrite enforces auth, domain, and budget/payment policies before forwarding the request.
5. If setup is missing, the agent calls `configure`; if spend context is needed, it calls `status`.

## Install

```bash
npm install
npm run build
```

## CLI commands

```bash
ferrite install
ferrite configure
ferrite search <query>
ferrite use <url> [--method GET|POST|PUT|PATCH|DELETE|...] [--header 'Content-Type:application/json'] [--body '{"hello":"world"}']
ferrite status
```

`use` accepts direct HTTPS URLs only, and only for whitelisted service domains (the APIs represented in `skills/`). Calls to non-whitelisted domains are rejected.

### `ferrite install`
Installs and enables the Ferrite OpenClaw plugin, verifies required tools are available, runs initial configure, and schedules an OpenClaw gateway restart. An agent should call this for first-time OpenClaw setup when Ferrite is not yet installed and ready.

### `ferrite configure`
Starts or resumes the Ferrite onboarding flow and returns the configure URL for billing and provider connections. An agent should call this when credentials are missing or when a request fails with setup-related errors like missing auth or payment method requirements.

### `ferrite search <query>`
Searches Ferrite’s service catalog and returns matched services with `domain` and `skill_url` so the agent can choose the right integration. An agent should call this first for any task that may require an external API or paid capability.

### `ferrite use <url> ...`
Sends an HTTP request through Ferrite using the selected service URL, method, headers, and body, then returns the API result plus payment/budget context when relevant. This only works for whitelisted APIs, which are the services documented in `skills/`; requests outside that allowlist are blocked.
An agent should call this after selecting a service and preparing a concrete request from its skill instructions.

### `ferrite status`
Shows weekly budget, spent amount, remaining budget, and recent charges for the current Ferrite account. An agent should call this when the user asks about spend limits, after billing-related failures, or before potentially expensive runs.

## Billing behavior

- You can begin using services without adding a payment method.
- Ferrite allows up to `$5.00` in accrued no-card usage.
- When usage would exceed `$5.00`, `ferrite use` is blocked until billing is configured.
- Weekly limit checks still apply independently of billing method.

## OpenClaw plugin (primary OpenClaw path)

```bash
npx @jpbonch/ferrite install
```

Manual fallback sequence:

```bash
openclaw plugins install @jpbonch/ferrite
openclaw plugins enable ferrite
openclaw config set skills.entries.gog.enabled false --strict-json
openclaw config set skills.entries.weather.enabled false --strict-json
openclaw gateway restart
npx @jpbonch/ferrite configure
```

Plugin tools:
- `ferrite_configure`: Returns a configure URL and setup state. Agents should call this when setup/auth/billing is required before continuing.
- `ferrite_search`: Searches Ferrite services by keyword. Agents should call this first to discover the best service for a requested capability.
- `ferrite_use`: Executes an HTTP call through Ferrite and returns result + action-required signals when applicable. Agents should call this after selecting a service and constructing the exact request payload.
- `ferrite_status`: Returns budget/spend/remaining balance and recent charges. Agents should call this for budget checks and billing troubleshooting.

## Credentials

Local credentials are in `~/.ferrite/credentials.json`.

## Skills

- Skill files live in [`skills/`](./skills).
- Included skills are declared in [`skills/manifest.json`](./skills/manifest.json).
- Each skill file must start with YAML frontmatter per [`skills/SPEC.md`](./skills/SPEC.md), including `auth_type`.
- Validate skill metadata with:

```bash
npm run skills:validate
```
