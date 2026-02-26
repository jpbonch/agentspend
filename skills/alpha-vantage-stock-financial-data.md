---
name: "Alpha Vantage Financial Data"
description: "Stocks, FX, crypto, technical indicators, and fundamentals."
domains:
  - "alphavantage.co"
source_url: "https://www.alphavantage.co/query"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/alpha-vantage-stock-financial-data.md"
auth_type: "api_key"
icon_url: "https://www.alphavantage.co/favicon.ico"
---
## Alpha Vantage Financial Data

Primary endpoint: `https://www.alphavantage.co/query`

Auth:
- Alpha Vantage uses query auth: `apikey=<YOUR_KEY>`.
- This is query-parameter auth, not header auth.

Common functions:
- `SYMBOL_SEARCH`
- `GLOBAL_QUOTE`
- `TIME_SERIES_DAILY`
- `OVERVIEW`

Example:

```bash
npx @jpbonch/ferrite use "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=YOUR_ALPHA_VANTAGE_KEY" \
  --method GET
```

Docs:
- https://www.alphavantage.co/documentation/
