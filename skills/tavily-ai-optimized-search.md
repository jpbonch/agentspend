---
name: "Tavily AI Search"
description: "AI-optimized web search, extraction, and crawl endpoints."
domains:
  - "tavily.com"
source_url: "https://api.tavily.com/search"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/tavily-ai-optimized-search.md"
auth_type: "api_key"
icon_url: "https://tavily.com/favicon.ico"
---
## Tavily AI Search

Primary endpoint: `https://api.tavily.com/search`

Auth:
- Use `Authorization: Bearer <TAVILY_API_KEY>`.

Common endpoints:
- `POST /search`
- `POST /extract`
- `POST /crawl`
- `POST /map`

Example:

```bash
npx @jpbonch/ferrite use https://api.tavily.com/search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"query":"latest SEC filings for NVIDIA","search_depth":"basic","max_results":5}'
```

Docs:
- https://docs.tavily.com/documentation/api-reference/introduction
- https://docs.tavily.com/documentation/api-reference/endpoint/search
