---
name: "Web Search (Semantic)"
description: "Semantic web search across pages relevant to a query."
domains:
  - "api.exa.ai"
source_url: "https://api.exa.ai/search"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/web-search-semantic.md"
auth_type: "api_key"
icon_url: "https://exa.ai/favicon.ico"
---
### Exa Web Search

`https://api.exa.ai/search`

Description: Semantic web search across pages relevant to a query.

Auth:
- Ferrite injects `x-api-key: <EXA_API_KEY>` for `api.exa.ai`.

Headers:
- `content-type:application/json`

Body guidance:
- `query` (string, required)
- `numResults` (number, optional)

Related Exa endpoints:
- `POST /search`
- `POST /findSimilar`
- `POST /contents`
- `POST /answer`

Example call (semantic search):

```bash
npx @jpbonch/ferrite use https://api.exa.ai/search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"query":"best practices for building AI agents","numResults":10}'
```

Example call (find similar pages):

```bash
npx @jpbonch/ferrite use https://api.exa.ai/findSimilar \
  --method POST \
  --header "content-type:application/json" \
  --body '{"url":"https://openai.com","numResults":5}'
```

Example call (answer mode):

```bash
npx @jpbonch/ferrite use https://api.exa.ai/answer \
  --method POST \
  --header "content-type:application/json" \
  --body '{"query":"What is the capital of France?"}'
```

Docs:
- https://exa.ai/docs/reference/getting-started
- https://exa.ai/docs/reference/search
- https://exa.ai/docs/reference/find-similar
