---
name: "X/Twitter Social User Search"
description: "Find social accounts/users matching a query."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/grok/user-search"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/x-twitter-social-user-search.md"
auth_type: "x402"
icon_url: "https://x.com/favicon.ico"
---
### Grok X/Twitter User Search

`https://stableenrich.dev/api/grok/user-search`

Description: Find X/Twitter users matching a query.
Price: $0.02 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `query` (string, required)
- `maxResults` (number, optional)

Related StableEnrich Grok endpoints:
- `POST /api/grok/user-posts`
- `POST /api/grok/x-search`

Example call (user search):

```bash
npx agentspend use https://stableenrich.dev/api/grok/user-search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"query":"AI researcher","maxResults":5}'
```

Example call (broader query):

```bash
npx agentspend use https://stableenrich.dev/api/grok/user-search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"query":"fintech founder","maxResults":20}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
