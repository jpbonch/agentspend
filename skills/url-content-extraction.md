---
name: "URL Content Extraction"
description: "Extract clean content for one or more URLs."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/exa/contents"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/url-content-extraction.md"
auth_type: "x402"
icon_url: "https://exa.ai/favicon.ico"
---
### Exa URL Content Extraction

`https://stableenrich.dev/api/exa/contents`

Description: Extract clean content for one or more URLs.
Price: $0.002 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `urls` (string[], required): one or more absolute URLs to extract.

Recommended workflow:
- Use `/api/exa/search` first to discover candidate URLs.
- Then call `/api/exa/contents` to fetch normalized article/page text.

Related StableEnrich Exa endpoints:
- `POST /api/exa/search`
- `POST /api/exa/find-similar`
- `POST /api/exa/answer`

Example call (single URL):

```bash
npx ferrite use https://stableenrich.dev/api/exa/contents \
  --method POST \
  --header "content-type:application/json" \
  --body '{"urls":["https://example.com"]}'
```

Example call (batch of URLs):

```bash
npx ferrite use https://stableenrich.dev/api/exa/contents \
  --method POST \
  --header "content-type:application/json" \
  --body '{"urls":["https://openai.com/research","https://docs.github.com/en/rest"]}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
