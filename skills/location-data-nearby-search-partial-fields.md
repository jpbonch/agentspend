---
name: "Location Data Nearby Search (Partial fields)"
description: "Find places near coordinates/radius with a smaller, cheaper field set."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/google-maps/nearby-search/partial"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/location-data-nearby-search-partial-fields.md"
auth_type: "x402"
icon_url: "https://maps.google.com/favicon.ico"
---
### Google Maps Nearby Search (Partial Fields)

`https://stableenrich.dev/api/google-maps/nearby-search/partial`

Description: Find places near coordinates/radius with a smaller, cheaper field set.
Price: $0.02 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `locationRestriction.circle.center.latitude` (number, required)
- `locationRestriction.circle.center.longitude` (number, required)
- `locationRestriction.circle.radius` (number, required, meters)
- `maxResultCount` (number, optional)
- `pageToken` (string, optional)
- `excludeFields` (array, optional): default excludes `photos`; pass `[]` to include.

Related StableEnrich endpoints:
- `POST /api/google-maps/nearby-search/full` (same body, richer fields, higher cost).
- `POST /api/google-maps/text-search/partial`
- `POST /api/google-maps/text-search/full`
- `GET /api/google-maps/place-details/full?placeId=...`

Example call (basic nearby):

```bash
npx @jpbonch/ferrite use https://stableenrich.dev/api/google-maps/nearby-search/partial \
  --method POST \
  --header "content-type:application/json" \
  --body '{"locationRestriction":{"circle":{"center":{"latitude":37.7749,"longitude":-122.4194},"radius":1000}},"maxResultCount":5}'
```

Example call (larger radius + include photos):

```bash
npx @jpbonch/ferrite use https://stableenrich.dev/api/google-maps/nearby-search/partial \
  --method POST \
  --header "content-type:application/json" \
  --body '{"locationRestriction":{"circle":{"center":{"latitude":34.0522,"longitude":-118.2437},"radius":3000}},"excludeFields":[],"maxResultCount":10}'
```

Example call (pagination):

```bash
npx @jpbonch/ferrite use https://stableenrich.dev/api/google-maps/nearby-search/partial \
  --method POST \
  --header "content-type:application/json" \
  --body '{"locationRestriction":{"circle":{"center":{"latitude":40.7128,"longitude":-74.0060},"radius":1500}},"pageToken":"NEXT_PAGE_TOKEN"}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
