---
name: "Cloudflare API"
description: "Manage Cloudflare accounts, zones, and DNS records with a user-provided API token."
domains:
  - "api.cloudflare.com"
source_url: "https://api.cloudflare.com/client/v4/zones"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/cloudflare-api.md"
auth_type: "user_api_key"
icon_url: "https://www.cloudflare.com/favicon.ico"
---
## Cloudflare API

Base URL: `https://api.cloudflare.com/client/v4`

Auth behavior:
- Connect your Cloudflare token in Ferrite Configure from the Services list (`Cloudflare API` -> `Connect`).
- Ferrite stores your key per account and injects it automatically for `api.cloudflare.com`.
- If you send `Authorization` (or configured query auth) on a request, your request value is used and Ferrite does not overwrite it.

Headers you should set:
- `content-type:application/json` for write operations.

Core endpoints:
- `GET /accounts` - list accounts available to your token.
- `GET /zones` - list zones.
- `GET /zones/{zone_id}/dns_records` - list DNS records in a zone.
- `POST /zones/{zone_id}/dns_records` - create DNS record.
- `PUT /zones/{zone_id}/dns_records/{dns_record_id}` - update DNS record.
- `DELETE /zones/{zone_id}/dns_records/{dns_record_id}` - delete DNS record.

Example call (list zones):

```bash
npx @jpbonch/ferrite use "https://api.cloudflare.com/client/v4/zones?per_page=20&page=1" \
  --method GET
```

Example call (list DNS records):

```bash
npx @jpbonch/ferrite use "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records?per_page=100" \
  --method GET
```

Example call (create DNS record):

```bash
npx @jpbonch/ferrite use "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records" \
  --method POST \
  --header "content-type:application/json" \
  --body '{"type":"A","name":"api.example.com","content":"203.0.113.10","ttl":120,"proxied":false}'
```

Example call (update DNS record):

```bash
npx @jpbonch/ferrite use "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records/DNS_RECORD_ID" \
  --method PUT \
  --header "content-type:application/json" \
  --body '{"type":"A","name":"api.example.com","content":"203.0.113.11","ttl":120,"proxied":false}'
```

Example call (delete DNS record):

```bash
npx @jpbonch/ferrite use "https://api.cloudflare.com/client/v4/zones/ZONE_ID/dns_records/DNS_RECORD_ID" \
  --method DELETE
```

Docs:
- https://developers.cloudflare.com/fundamentals/api/how-to/make-api-calls/
- https://developers.cloudflare.com/api/resources/zones/methods/list/
- https://developers.cloudflare.com/api/resources/dns/subresources/records/methods/list/
- https://developers.cloudflare.com/api/resources/dns/subresources/records/methods/create/
