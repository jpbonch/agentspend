---
name: "Hunter Email Addresses"
description: "Find, verify, and enrich professional email addresses."
domains:
  - "hunter.io"
source_url: "https://api.hunter.io/v2/domain-search"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/hunter-email-addresses.md"
auth_type: "api_key"
icon_url: "https://hunter.io/favicon.ico"
---
## Hunter Email Addresses

Primary endpoint family: `https://api.hunter.io/v2/...`

Auth:
- Hunter uses query auth: `api_key=<YOUR_KEY>`.

Common endpoints:
- `GET /v2/domain-search`
- `GET /v2/email-finder`
- `GET /v2/email-verifier`

Example:

```bash
npx @jpbonch/ferrite use "https://api.hunter.io/v2/domain-search?domain=stripe.com&api_key=YOUR_HUNTER_KEY" \
  --method GET
```

Docs:
- https://help.hunter.io/en/articles/1970956-hunter-api
