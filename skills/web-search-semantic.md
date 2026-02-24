---
name: "Web Search (Semantic)"
description: "Semantic web search across pages relevant to a query."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/exa/search"
skill_url: "https://raw.githubusercontent.com/agentspend/agentspend/main/skills/web-search-semantic.md"
auth_type: "x402"
icon_url: "https://exa.ai/favicon.ico"
---
### Exa Web Search

`https://stableenrich.dev/api/exa/search`

Description: Semantic web search across pages relevant to a query.
Price: $0.01 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `query` (string, required)
- `numResults` (number, optional; up to 100)

Related StableEnrich Exa endpoints:
- `POST /api/exa/find-similar`
- `POST /api/exa/contents`
- `POST /api/exa/answer`

Example call (semantic search):

```bash
npx agentspend use https://stableenrich.dev/api/exa/search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"query":"best practices for building AI agents","numResults":10}'
```

Example call (find similar pages):

```bash
npx agentspend use https://stableenrich.dev/api/exa/find-similar \
  --method POST \
  --header "content-type:application/json" \
  --body '{"url":"https://openai.com","numResults":5}'
```

Example call (answer mode):

```bash
npx agentspend use https://stableenrich.dev/api/exa/answer \
  --method POST \
  --header "content-type:application/json" \
  --body '{"query":"What is the capital of France?"}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
