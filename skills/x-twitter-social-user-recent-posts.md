---
name: "X/Twitter API User Recent Posts"
description: "Fetch recent posts from a user timeline via the official X API."
domains:
  - "api.x.com"
source_url: "https://docs.x.com/x-api/users/get-posts"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/x-twitter-social-user-recent-posts.md"
auth_type: "api_key"
icon_url: "https://x.com/favicon.ico"
---
### X API User Recent Posts

Primary endpoint:

`GET https://api.x.com/2/users/{id}/tweets`

Estimated Ferrite platform fee: $0.01 per request (configurable).

If you only have a handle, resolve it first:

`GET https://api.x.com/2/users/by/username/{username}`

Authentication:
- `Authorization: Bearer <token>` (platform-managed key on `api.x.com`)

Headers:
- `accept:application/json`
- `authorization: Bearer <token>` (injected by Ferrite platform key unless you provide your own)

Query parameters for `GET /2/users/{id}/tweets`:
- `max_results` (integer, optional): `5` to `100`, default `10`.
- `exclude` (string, optional): comma-separated exclusions (`replies`, `retweets`).
- `pagination_token` (string, optional): pagination token.
- `since_id`, `until_id` (string, optional): ID range filters.
- `start_time`, `end_time` (string, optional): ISO-8601 timestamp filters.
- `tweet.fields` (string, optional): comma-separated tweet fields.
- `expansions` (string, optional): object expansions.
- `user.fields`, `media.fields`, `place.fields`, `poll.fields` (optional): expanded object fields.

Example call (lookup user ID by handle):

```bash
npx @jpbonch/ferrite use "https://api.x.com/2/users/by/username/elonmusk?user.fields=id,username,public_metrics" \
  --method GET \
  --header "accept:application/json"
```

Example call (fetch recent posts by user ID):

```bash
npx @jpbonch/ferrite use "https://api.x.com/2/users/44196397/tweets?max_results=20&exclude=replies,retweets&tweet.fields=created_at,public_metrics,lang&expansions=author_id&user.fields=username,name,profile_image_url" \
  --method GET \
  --header "accept:application/json"
```

Docs:
- https://docs.x.com/x-api/users/get-posts
- https://docs.x.com/x-api/users/get-user-by-username
