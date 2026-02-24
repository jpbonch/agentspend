---
name: "Location Data Text Search (Partial fields)"
description: "Search Google Maps places by natural-language query with a smaller, cheaper field set."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/google-maps/text-search/partial"
skill_url: "https://raw.githubusercontent.com/agentspend/agentspend/main/skills/location-data-text-search-partial-fields.md"
auth_type: "x402"
icon_url: "https://maps.google.com/favicon.ico"
---
### Google Maps Text Search (Partial Fields)

`https://stableenrich.dev/api/google-maps/text-search/partial`

Description: Search Google Maps places by natural-language query with a smaller, cheaper field set.
Price: $0.02 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `textQuery` (string, required): what you are searching for.
- `maxResultCount` (number, optional): reduce payload/cost for exploration.
- `pageToken` (string, optional): paginate to next page.
- `excludeFields` (array, optional): remove heavy fields from response. Google Maps endpoints default to excluding `photos`; pass `[]` if you want them included.

Related StableEnrich endpoints:
- `POST /api/google-maps/text-search/full` (same request body, richer fields, higher cost).
- `POST /api/google-maps/nearby-search/partial`
- `POST /api/google-maps/nearby-search/full`
- `GET /api/google-maps/place-details/full?placeId=...`
- `GET /api/google-maps/place-details/partial?placeId=...`

Example call (basic):

```bash
npx agentspend use https://stableenrich.dev/api/google-maps/text-search/partial \
  --method POST \
  --header "content-type:application/json" \
  --body '{"textQuery":"coffee shops in San Francisco","maxResultCount":5}'
```

Example call (with geographic restriction):

```bash
npx agentspend use https://stableenrich.dev/api/google-maps/text-search/partial \
  --method POST \
  --header "content-type:application/json" \
  --body '{"textQuery":"coworking space","locationRestriction":{"circle":{"center":{"latitude":37.7749,"longitude":-122.4194},"radius":2000}},"maxResultCount":10}'
```

Example call (pagination):

```bash
npx agentspend use https://stableenrich.dev/api/google-maps/text-search/partial \
  --method POST \
  --header "content-type:application/json" \
  --body '{"textQuery":"bookstores in Seattle","pageToken":"NEXT_PAGE_TOKEN"}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
