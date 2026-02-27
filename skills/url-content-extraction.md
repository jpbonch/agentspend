---
name: "URL Content Extraction"
description: "Extract clean content for one or more URLs."
domains:
  - "api.exa.ai"
source_url: "https://api.exa.ai/contents"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/url-content-extraction.md"
auth_type: "api_key"
icon_url: "https://exa.ai/favicon.ico"
---
### Exa URL Content Extraction

`https://api.exa.ai/contents`

Description: Extract clean content for one or more URLs.

Auth:
- Ferrite injects `x-api-key: <EXA_API_KEY>` for `api.exa.ai`.

Headers:
- `content-type:application/json`

Body guidance:
- `urls` (string[], required): one or more absolute URLs to extract.

Recommended workflow:
- Use `/search` first to discover candidate URLs.
- Then call `/contents` to fetch normalized article/page text.

Related Exa endpoints:
- `POST /search`
- `POST /contents`

Example call (single URL):

```bash
npx @jpbonch/ferrite use https://api.exa.ai/contents \
  --method POST \
  --header "content-type:application/json" \
  --body '{"urls":["https://example.com"]}'
```

Example call (batch of URLs):

```bash
npx @jpbonch/ferrite use https://api.exa.ai/contents \
  --method POST \
  --header "content-type:application/json" \
  --body '{"urls":["https://openai.com/research","https://docs.github.com/en/rest"]}'
```

Docs:
- https://exa.ai/docs/reference/getting-started
- https://exa.ai/docs/reference/contents
