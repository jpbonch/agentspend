# agentspend

AgentSpend CLI for calling x402 endpoints through AgentSpend Cloud.

## Install

```bash
npm install
npm run build
```

## Commands

```bash
agentspend configure
agentspend pay <url> [--method GET|POST] [--body '{"hello":"world"}'] [--header 'Content-Type:application/json'] [--max-cost 5.000000]
agentspend check <url>
agentspend status
```

## Credentials

Credentials are stored at `~/.agentspend/credentials.json`.

## Dev API URL override

Set `AGENTSPEND_API_URL` to target a local backend.
