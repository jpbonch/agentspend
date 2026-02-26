---
name: "Polymarket Markets"
description: "List prediction markets from Polymarket Gamma API."
domains:
  - "gamma-api.polymarket.com"
source_url: "https://gamma-api.polymarket.com/markets"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/polymarket-markets.md"
auth_type: "none"
icon_url: "https://polymarket.com/favicon.ico"
---
## Polymarket Markets

`https://gamma-api.polymarket.com/markets`

Description: List prediction markets from Polymarket Gamma API.
Price: Usually free endpoint behavior; no x402 payment required for most calls.

Example call:

```bash
npx @jpbonch/ferrite use "https://gamma-api.polymarket.com/markets?limit=10" \
  --method GET
```
