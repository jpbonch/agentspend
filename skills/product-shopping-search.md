---
name: "Product Shopping Search"
description: "Search shopping/product listings for a query."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/serper/shopping"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/product-shopping-search.md"
auth_type: "x402"
icon_url: "https://serper.dev/favicon.ico"
---
### Serper Shopping Search

`https://stableenrich.dev/api/serper/shopping`

Description: Search shopping/product listings for a query.
Price: $0.04 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `q` (string, required): product query.
- `num` (number, optional): result count.
- `gl` (string, optional): geolocation (for example `us`).
- `hl` (string, optional): language (for example `en`).

Related StableEnrich endpoint:
- `POST /api/serper/news` for news results.

Example call (basic shopping search):

```bash
npx ferrite use https://stableenrich.dev/api/serper/shopping \
  --method POST \
  --header "content-type:application/json" \
  --body '{"q":"wireless earbuds","num":10,"gl":"us","hl":"en"}'
```

Example call (narrower result set):

```bash
npx ferrite use https://stableenrich.dev/api/serper/shopping \
  --method POST \
  --header "content-type:application/json" \
  --body '{"q":"standing desk","num":5,"gl":"us","hl":"en"}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
