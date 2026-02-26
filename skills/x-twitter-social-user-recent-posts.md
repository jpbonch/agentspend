---
name: "X/Twitter Social User Recent Posts"
description: "Fetch recent posts for a specific social handle."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/grok/user-posts"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/x-twitter-social-user-recent-posts.md"
auth_type: "x402"
icon_url: "https://x.com/favicon.ico"
---
### Grok X/Twitter User Recent Posts

`https://stableenrich.dev/api/grok/user-posts`

Description: Fetch recent posts for a specific social handle.
Price: $0.02 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `handle` (string, required): account handle without `@`.
- `maxResults` (number, optional)

Related StableEnrich Grok endpoints:
- `POST /api/grok/user-search`
- `POST /api/grok/x-search`

Example call (recent posts):

```bash
npx @jpbonch/ferrite use https://stableenrich.dev/api/grok/user-posts \
  --method POST \
  --header "content-type:application/json" \
  --body '{"handle":"elonmusk","maxResults":5}'
```

Example call (deeper post sample):

```bash
npx @jpbonch/ferrite use https://stableenrich.dev/api/grok/user-posts \
  --method POST \
  --header "content-type:application/json" \
  --body '{"handle":"sama","maxResults":20}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
