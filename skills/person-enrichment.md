---
name: "Person Enrichment"
description: "Enrich a single person profile from an identifier (for example, Apollo ID or email)."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/apollo/people-enrich"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/person-enrichment.md"
auth_type: "x402"
icon_url: "https://www.apollo.io/favicon.ico"
---
### Apollo Person Enrichment

`https://stableenrich.dev/api/apollo/people-enrich`

Description: Enrich a single person profile from an identifier (for example Apollo person ID or email).
Price: $0.0495 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- Use one strong identifier, usually `id` from people-search or `email`.
- If you searched with `/api/apollo/people-search`, pass the returned person `id` directly to enrich.

Related StableEnrich endpoints:
- `POST /api/apollo/people-enrich/bulk` (up to 10 people)
- `POST /api/apollo/people-search`
- `POST /api/clado/contacts-enrich` (fallback for missing contact info)

Example call (by person ID):

```bash
npx @jpbonch/ferrite use https://stableenrich.dev/api/apollo/people-enrich \
  --method POST \
  --header "content-type:application/json" \
  --body '{"id":"5c4efb6fa3ae613258c36ac7"}'
```

Example call (by email):

```bash
npx @jpbonch/ferrite use https://stableenrich.dev/api/apollo/people-enrich \
  --method POST \
  --header "content-type:application/json" \
  --body '{"email":"tim@apple.com"}'
```

Example call (bulk enrich up to 10):

```bash
npx @jpbonch/ferrite use https://stableenrich.dev/api/apollo/people-enrich/bulk \
  --method POST \
  --header "content-type:application/json" \
  --body '{"details":[{"email":"tim@apple.com"},{"email":"satya@microsoft.com"}]}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
