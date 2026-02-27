---
name: "X/Twitter Search"
description: "Search X and Twitter posts and users, including recent/all post search and user timelines."
domains:
  - "api.x.com"
source_url: "https://api.x.com/2/tweets/search/recent"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/x-twitter-search.md"
auth_type: "api_key"
icon_url: "https://x.com/favicon.ico"
---
### X/Twitter Search

Use this skill for:
- keyword search across recent posts
- keyword search across historical posts (if your X API plan supports `/all`)
- user discovery
- fetching recent posts from a specific user

Primary endpoints:
- `GET https://api.x.com/2/tweets/search/recent`
- `GET https://api.x.com/2/tweets/search/all`
- `GET https://api.x.com/2/users/search`
- `GET https://api.x.com/2/users/by/username/{username}`
- `GET https://api.x.com/2/users/{id}/tweets`

Estimated Ferrite platform fee: $0.01 per request (configurable).

Authentication:
- `Authorization: Bearer <token>` (platform-managed key on `api.x.com`)

Headers:
- `accept:application/json`
- `authorization: Bearer <token>` (injected by Ferrite platform key unless you provide your own)

Common parameter guidance:
- Post search endpoints require `query`.
- Use `max_results`, pagination tokens, `start_time`/`end_time`, and `tweet.fields` as needed.
- User timeline endpoint supports filters such as `exclude`, time filters, and `tweet.fields`.
- If you only have a handle, resolve the user ID with `/2/users/by/username/{username}` first.

Example call (recent post search):

```bash
npx @jpbonch/ferrite use "https://api.x.com/2/tweets/search/recent?query=(ai%20OR%20ml)%20lang:en%20-has:links&max_results=20&tweet.fields=created_at,public_metrics,author_id" \
  --method GET \
  --header "accept:application/json"
```

Example call (all post search):

```bash
npx @jpbonch/ferrite use "https://api.x.com/2/tweets/search/all?query=from:openai%20has:media&start_time=2024-01-01T00:00:00Z&max_results=50&tweet.fields=created_at,public_metrics" \
  --method GET \
  --header "accept:application/json"
```

Example call (user search):

```bash
npx @jpbonch/ferrite use "https://api.x.com/2/users/search?query=ai%20researcher&max_results=25&user.fields=description,public_metrics,verified" \
  --method GET \
  --header "accept:application/json"
```

Example call (recent posts by username):

```bash
# Step 1: resolve user ID
npx @jpbonch/ferrite use "https://api.x.com/2/users/by/username/elonmusk?user.fields=id,username,public_metrics" \
  --method GET \
  --header "accept:application/json"

# Step 2: fetch timeline
npx @jpbonch/ferrite use "https://api.x.com/2/users/44196397/tweets?max_results=20&exclude=replies,retweets&tweet.fields=created_at,public_metrics,lang" \
  --method GET \
  --header "accept:application/json"
```

Docs:
- https://docs.x.com/x-api/posts/recent-search
- https://docs.x.com/x-api/posts/search-introduction
- https://docs.x.com/x-api/users/search-users
- https://docs.x.com/x-api/users/get-posts
- https://docs.x.com/x-api/users/get-user-by-username
