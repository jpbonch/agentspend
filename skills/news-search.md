---
name: "News Search"
description: "Search recent news articles for a query."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/serper/news"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/news-search.md"
auth_type: "x402"
icon_url: "https://serper.dev/favicon.ico"
---
### Serper News Search

`https://stableenrich.dev/api/serper/news`

Description: Search recent news articles for a query.
Price: $0.04 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `q` (string, required): news query.
- `num` (number, optional): result count.
- `gl` (string, optional): geolocation (for example `us`).
- `hl` (string, optional): language (for example `en`).

Related StableEnrich endpoint:
- `POST /api/serper/shopping` for shopping/product results.

Example call (US + English):

```bash
npx agentspend use https://stableenrich.dev/api/serper/news \
  --method POST \
  --header "content-type:application/json" \
  --body '{"q":"OpenAI funding","num":10,"gl":"us","hl":"en"}'
```

Example call (UK + English):

```bash
npx agentspend use https://stableenrich.dev/api/serper/news \
  --method POST \
  --header "content-type:application/json" \
  --body '{"q":"UK AI regulation","num":5,"gl":"uk","hl":"en"}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
