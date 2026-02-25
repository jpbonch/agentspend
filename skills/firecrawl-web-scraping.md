---
name: "Firecrawl Web Scraping"
description: "Scrape, crawl, map, and extract structured web data."
domains:
  - "firecrawl.dev"
source_url: "https://api.firecrawl.dev/v2/scrape"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/firecrawl-web-scraping.md"
auth_type: "api_key"
icon_url: "https://firecrawl.dev/favicon.ico"
---
## Firecrawl Web Scraping

Primary endpoint: `https://api.firecrawl.dev/v2/scrape`

Auth:
- Use `Authorization: Bearer <FIRECRAWL_API_KEY>`.

Common endpoints:
- `POST /v2/scrape`
- `POST /v2/crawl`
- `POST /v2/map`
- `POST /v2/search`

Example:

```bash
npx ferrite use https://api.firecrawl.dev/v2/scrape \
  --method POST \
  --header "content-type:application/json" \
  --body '{"url":"https://example.com","formats":["markdown"]}'
```

Docs:
- https://docs.firecrawl.dev/api-reference/v2-introduction
- https://docs.firecrawl.dev/api-reference/endpoint/scrape
