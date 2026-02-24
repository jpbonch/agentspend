---
name: "Notion API"
description: "Connected Notion workspace APIs for search, pages, databases, and blocks."
domains:
  - "notion.com"
source_url: "https://api.notion.com/v1/search"
skill_url: "https://raw.githubusercontent.com/agentspend/agentspend/main/skills/notion-api.md"
auth_type: "oauth"
icon_url: "https://www.notion.so/images/favicon.ico"
---
## Notion API (OAuth)

`notion.com` (via AgentSpend OAuth + Nango)

Description: Use your connected Notion workspace to search and manage pages/databases/blocks.
Price: Provider/API dependent. AgentSpend call cost depends on endpoint x402 policy.

OAuth behavior:
- Connect Notion in `agentspend configure` first.
- Do not send an `Authorization` header; AgentSpend + Nango handles OAuth tokens.

Headers you should set:
- `notion-version:2025-09-03` (or the version your workspace/integration is pinned to).
- `accept:application/json`.
- `content-type:application/json` for `POST`/`PATCH`.

Body guidance:
- Create page requires `parent` and `properties`.
- Rich text/content payloads are block objects (for example paragraph blocks with `rich_text` arrays).
- Data source query bodies support `filter`, `sorts`, `page_size`, and `start_cursor`.

Common endpoints:
- `POST /v1/search` - Search pages and data sources.
- `GET /v1/pages/{page_id}` - Retrieve page metadata/properties.
- `PATCH /v1/pages/{page_id}` - Update page properties.
- `POST /v1/pages` - Create a new page.
- `GET /v1/blocks/{block_id}/children` - Read block children.
- `PATCH /v1/blocks/{block_id}/children` - Append children blocks.
- `POST /v1/data_sources/{data_source_id}/query` - Query a data source.

Example call (search):

```bash
npx agentspend use https://api.notion.com/v1/search \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --header "notion-version:2025-09-03" \
  --body '{"query":"weekly planning"}'
```

Example call (retrieve page):

```bash
npx agentspend use https://api.notion.com/v1/pages/PAGE_ID \
  --method GET \
  --header "accept:application/json" \
  --header "notion-version:2025-09-03"
```

Example call (query a data source):

```bash
npx agentspend use https://api.notion.com/v1/data_sources/DATA_SOURCE_ID/query \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --header "notion-version:2025-09-03" \
  --body '{"page_size":25,"sorts":[{"timestamp":"last_edited_time","direction":"descending"}]}'
```

Example call (create page under a parent page):

```bash
npx agentspend use https://api.notion.com/v1/pages \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --header "notion-version:2025-09-03" \
  --body '{"parent":{"page_id":"PARENT_PAGE_ID"},"properties":{"title":{"title":[{"type":"text","text":{"content":"AgentSpend Note"}}]}}}'
```

Example call (append a paragraph block):

```bash
npx agentspend use https://api.notion.com/v1/blocks/PAGE_OR_BLOCK_ID/children \
  --method PATCH \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --header "notion-version:2025-09-03" \
  --body '{"children":[{"object":"block","type":"paragraph","paragraph":{"rich_text":[{"type":"text","text":{"content":"Hello from AgentSpend"}}]}}]}'
```

Official docs:
- https://developers.notion.com/reference/intro
- https://developers.notion.com/reference/post-search
- https://developers.notion.com/reference/post-page
- https://developers.notion.com/reference/patch-block-children
- https://developers.notion.com/reference/query-a-data-source
