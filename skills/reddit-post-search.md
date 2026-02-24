---
name: "Reddit Post Search"
description: "Search community/forum posts by keyword and filters."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/reddit/search"
skill_url: "https://raw.githubusercontent.com/agentspend/agentspend/main/skills/reddit-post-search.md"
auth_type: "x402"
icon_url: "https://www.reddit.com/favicon.ico"
---
### Reddit Post Search

`https://stableenrich.dev/api/reddit/search`

Description: Search Reddit posts by keyword and filters.
Price: $0.02 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `query` (string, required)
- `sort` (string, optional; for example `top`, `new`, `relevance`)
- `timeframe` (string, optional; for example `day`, `week`, `month`)
- `maxResults` (number, optional)

Important two-step workflow:
1. Use this endpoint to fan out and find candidate posts quickly.
2. If a result has truncated content (`selftextTruncated: true`) or you need comments, call `/api/reddit/post-comments` with that post URL/permalink.

Related StableEnrich endpoint:
- `POST /api/reddit/post-comments`

Example call (basic search):

```bash
npx agentspend use https://stableenrich.dev/api/reddit/search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"query":"AI agents","sort":"top","timeframe":"week","maxResults":10}'
```

Example call (fresh posts):

```bash
npx agentspend use https://stableenrich.dev/api/reddit/search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"query":"open source MCP server","sort":"new","timeframe":"day","maxResults":20}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
