---
name: "Reddit Community Post + Comments"
description: "Fetch a community post together with its comments by URL."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/reddit/post-comments"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/reddit-community-post-comments.md"
auth_type: "x402"
icon_url: "https://www.reddit.com/favicon.ico"
---
### Reddit Post + Comments

`https://stableenrich.dev/api/reddit/post-comments`

Description: Fetch a Reddit post with full (untruncated) selftext and comments.
Price: $0.02 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `url` (string, required): full Reddit post URL or permalink.

Recommended workflow:
- First use `/api/reddit/search` to find relevant posts.
- Then call this endpoint for high-value posts to pull full text and thread context.

Related StableEnrich endpoint:
- `POST /api/reddit/search`

Example call (fetch full post + comments):

```bash
npx @jpbonch/ferrite use https://stableenrich.dev/api/reddit/post-comments \
  --method POST \
  --header "content-type:application/json" \
  --body '{"url":"https://www.reddit.com/r/AskReddit/comments/abc123/example_post"}'
```

Example call (URL from prior search result):

```bash
npx @jpbonch/ferrite use https://stableenrich.dev/api/reddit/post-comments \
  --method POST \
  --header "content-type:application/json" \
  --body '{"url":"https://www.reddit.com/r/MachineLearning/comments/xyz999/example_discussion"}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
