---
name: "NewsAPI News Articles"
description: "Search top headlines and article feeds from global news sources."
domains:
  - "newsapi.org"
source_url: "https://newsapi.org/v2/top-headlines"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/newsapi-news-articles.md"
auth_type: "api_key"
icon_url: "https://newsapi.org/favicon.ico"
---
## NewsAPI News Articles

Primary endpoint: `https://newsapi.org/v2/top-headlines`

Auth:
- Preferred header: `X-Api-Key: <NEWSAPI_KEY>`
- Also supported: `Authorization: <NEWSAPI_KEY>`

Common endpoints:
- `GET /v2/top-headlines`
- `GET /v2/everything`
- `GET /v2/top-headlines/sources`

Example:

```bash
npx agentspend use "https://newsapi.org/v2/top-headlines?country=us&category=technology&pageSize=10" \
  --method GET
```

Docs:
- https://newsapi.org/docs/authentication
- https://newsapi.org/docs/endpoints/top-headlines
