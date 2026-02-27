---
name: "Context7 Documentation API"
description: "Search libraries and fetch up-to-date documentation context for coding questions."
domains:
  - "context7.com"
source_url: "https://context7.com/api/v2/context"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/context7-documentation-api.md"
auth_type: "api_key"
icon_url: "https://context7.com/favicon.ico"
---
## Context7 Documentation API

Base URL: `https://context7.com`

Auth behavior:
- Ferrite injects `Authorization: Bearer <CONTEXT7_API_KEY>` for `context7.com`.

Core endpoints:
- `GET /api/v2/libs/search` - search for matching libraries with `libraryName` and `query`.
- `GET /api/v2/context` - fetch relevant documentation context for a `libraryId` and `query`.
- `GET /api/v2/context?type=txt` - request plain text output for compact prompt context.

Suggested flow:
1. Call `/api/v2/libs/search` to identify the best `libraryId` (for example `/vercel/next.js`).
2. Call `/api/v2/context` with that `libraryId` and your task-specific query.

Common query params:
- `libraryName` (required for `/api/v2/libs/search`)
- `libraryId` (required for `/api/v2/context`)
- `query` (required)
- `type` (optional: `json` default, `txt` for plain text)

Example call (search):

```bash
npx @jpbonch/ferrite use "https://context7.com/api/v2/libs/search?libraryName=nextjs&query=middleware%20auth"
```

Example call (context as JSON):

```bash
npx @jpbonch/ferrite use "https://context7.com/api/v2/context?libraryId=/vercel/next.js&query=How%20do%20I%20protect%20routes%20with%20middleware"
```

Example call (context as text):

```bash
npx @jpbonch/ferrite use "https://context7.com/api/v2/context?libraryId=/vercel/next.js&query=app%20router%20data%20fetching&type=txt"
```

Notes:
- API keys are created in the Context7 dashboard and typically start with `ctx7sk-`.
- Rate limits return `429`; retry with backoff in your workflow if needed.

Docs:
- https://context7.com/docs/api-guide
- https://context7.com/docs/howto/api-keys
- https://context7.com/docs/overview
