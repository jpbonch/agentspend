---
name: "People Search"
description: "Search people records using keyword and location filters."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/apollo/people-search"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/people-search.md"
auth_type: "x402"
icon_url: "https://www.apollo.io/favicon.ico"
---
### Apollo People Search

`https://stableenrich.dev/api/apollo/people-search`

Description: Search people records using keyword, geography, and company filters.
Price: $0.02 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `q_keywords` (string, common)
- `person_locations` (string[], common)
- `per_page` (number, optional)
- `page` (number, optional, pagination)
- For organization-filtered bulk workflows, verify org identifiers first with `/api/apollo/org-search`.

Important workflow notes:
- Apollo people search can return obfuscated names; follow with `/api/apollo/people-enrich` immediately for full profiles.
- If Apollo misses data (especially personal email/phone/newer profiles), fallback to Clado endpoints.

Related StableEnrich endpoints:
- `POST /api/apollo/org-search`
- `POST /api/apollo/people-enrich`
- `POST /api/apollo/people-enrich/bulk`
- `POST /api/apollo/org-enrich`
- `POST /api/clado/contacts-enrich`

Example call (keyword + location):

```bash
npx agentspend use https://stableenrich.dev/api/apollo/people-search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"q_keywords":"software engineer","person_locations":["San Francisco"],"per_page":5}'
```

Example call (paginated):

```bash
npx agentspend use https://stableenrich.dev/api/apollo/people-search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"q_keywords":"product manager","person_locations":["New York"],"per_page":25,"page":2}'
```

Example call (find org IDs first):

```bash
npx agentspend use https://stableenrich.dev/api/apollo/org-search \
  --method POST \
  --header "content-type:application/json" \
  --body '{"q_keywords":"stripe","organization_locations":["United States"],"per_page":5}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
