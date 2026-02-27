---
name: "X/Twitter API User Search"
description: "Search X users by keyword via the official X API."
domains:
  - "api.x.com"
source_url: "https://docs.x.com/x-api/users/search-users"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/x-twitter-social-user-search.md"
auth_type: "api_key"
icon_url: "https://x.com/favicon.ico"
---
### X API Search Users

`GET https://api.x.com/2/users/search`

Description: Retrieve users matching a search query.
Estimated Ferrite platform fee: $0.01 per request (configurable).

Authentication:
- `Authorization: Bearer <token>` (platform-managed key on `api.x.com`)

Headers:
- `accept:application/json`
- `authorization: Bearer <token>` (injected by Ferrite platform key unless you provide your own)

Query parameters:
- `query` (string, required): user search text.
- `max_results` (integer, optional): `1` to `1000`, default `100`.
- `next_token` (string, optional): pagination token from a prior response.
- `user.fields` (string, optional): comma-separated user fields.
- `expansions` (string, optional): object expansions.
- `tweet.fields`, `media.fields`, `place.fields`, `poll.fields` (optional): additional expanded fields.

Example call (keyword search):

```bash
npx @jpbonch/ferrite use "https://api.x.com/2/users/search?query=ai%20researcher&max_results=25&user.fields=description,public_metrics,verified" \
  --method GET \
  --header "accept:application/json"
```

Example call (pagination):

```bash
npx @jpbonch/ferrite use "https://api.x.com/2/users/search?query=ai%20researcher&max_results=25&next_token=NEXT_PAGE_TOKEN&user.fields=description,public_metrics,verified" \
  --method GET \
  --header "accept:application/json"
```

Docs:
- https://docs.x.com/x-api/users/search-users
- https://docs.x.com/x-api/users/search/introduction
