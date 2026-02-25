---
name: "AgentScale"
description: "Deploy web apps and APIs via CLI, with x402 credit top-ups via HTTP."
domains:
  - "agentscale.co"
  - "api.agentscale.co"
source_url: "https://agentscale.co/docs"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/agentscale.md"
auth_type: "x402"
execution_mode: "hybrid_cli"
icon_url: "https://agentscale.co/favicon.ico"
---
### AgentScale

`https://agentscale.co/docs`

Description: Deploy apps and APIs to a public URL quickly.

Execution split (hybrid CLI):
- CLI steps stay local: `register`, `deploy`, `list`, `account`.
- Credit purchase stays HTTP and should be called through Ferrite: `POST https://api.agentscale.co/add-credits`.

CLI commands:

```bash
npx agentscale register
npx agentscale deploy
npx agentscale deploy --name myapp
npx agentscale list
npx agentscale account
```

Command reference (for agents):

1. `npx agentscale register`
- Run when no API key exists yet.
- Creates/saves API key at `~/.agentscale/config.json`.
- Safe to run outside any project directory.

2. `npx agentscale deploy`
- Run from the project root you want to deploy.
- Packages current directory and deploys it.
- Success cues to look for:
  - `Deployed to service: <name>`
  - `URL: https://<name>.agentscale.app`
- If free-tier text mentions `expire in 1 hour`, prompt for top-up via Ferrite HTTP call.

3. `npx agentscale deploy --name <service-name>`
- Same as deploy, but pins service name instead of auto-generated name.
- Use this when user requests a specific stable service URL prefix.

4. `npx agentscale list`
- Shows currently deployed services, status, URLs, and credit summary.
- Use after deploy to confirm service state (`running` or `expires in ...`).

5. `npx agentscale account`
- Shows tier, credits, burn rate, and time remaining.
- Use this before/after top-up to verify new credit balance.

Recommended command flow:
1. Register once (`register`) if key missing.
2. Deploy from target project dir (`deploy`).
3. Verify service and URL (`list`).
4. Check credit/tier state (`account`).
5. If credits needed, call HTTP add-credits via Ferrite and then re-run `account`.

Credit top-up via Ferrite (HTTP x402 path):

```bash
npx ferrite use https://api.agentscale.co/add-credits \
  --method POST \
  --header "x-api-key:<YOUR_AGENTSCALE_API_KEY>" \
  --header "content-type:application/json" \
  --body '{"amount_cents":1000}'
```

API key location:
- `~/.agentscale/config.json` (created by `npx agentscale register`)

Current limits and billing (from docs):
- Free tier: 1 service max, deploy expires after 1 hour.
- Paid tier: no expiry, credits deducted hourly.
- Payments: x402, USDC on Base, `amount_cents` request body for add-credits.

Docs:
- https://agentscale.co/docs
- https://agentscale.co/skill.md
