---
name: "Place Details Lookup (Full fields)"
description: "Get detailed Google Maps place information for a known place ID."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/google-maps/place-details/full?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/place-details-lookup-full-fields.md"
auth_type: "x402"
icon_url: "https://maps.google.com/favicon.ico"
---
### Google Maps Place Details (Full Fields)

`https://stableenrich.dev/api/google-maps/place-details/full?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4`

Description: Get detailed Google Maps place information for a known place ID.
Price: $0.05 per request (published).

Request guidance:
- Method: `GET`
- Required query param: `placeId`
- Typical workflow: run text/nearby search first, then call place-details for specific results.

Related StableEnrich endpoints:
- `GET /api/google-maps/place-details/partial?placeId=...` (cheaper, fewer fields).
- `POST /api/google-maps/text-search/partial`
- `POST /api/google-maps/nearby-search/partial`

Example call (full details by placeId):

```bash
npx agentspend use "https://stableenrich.dev/api/google-maps/place-details/full?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4" \
  --method GET
```

Example call (partial details variant):

```bash
npx agentspend use "https://stableenrich.dev/api/google-maps/place-details/partial?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4" \
  --method GET
```

Example call (search then detail lookup):

```bash
npx agentspend use https://stableenrich.dev/api/google-maps/text-search/partial \
  --method POST \
  --header "content-type:application/json" \
  --body '{"textQuery":"best ramen in Austin","maxResultCount":3}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
