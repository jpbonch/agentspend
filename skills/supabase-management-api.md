---
name: "Supabase Management API"
description: "Manage Supabase organizations, projects, and databases via the Management API."
domains:
  - "api.supabase.com"
source_url: "https://api.supabase.com/v1/projects"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/supabase-management-api.md"
auth_type: "oauth"
icon_url: "https://supabase.com/favicon.ico"
---
## Supabase Management API (OAuth)

`api.supabase.com` (via Ferrite OAuth)

Description: Use your connected Supabase account to manage organizations, projects, and run SQL queries through the Supabase Management API.

OAuth behavior:
- Connect Supabase in `ferrite configure` first.
- Do not send an `Authorization` header; Ferrite injects OAuth tokens for this domain.

Headers you should set:
- `accept:application/json` for JSON responses.
- `content-type:application/json` for `POST` requests with bodies.

Core endpoints:
- `GET /v1/organizations` - list organizations you belong to.
- `GET /v1/projects` - list your projects.
- `POST /v1/projects/{ref}/database/query` - run SQL query.
- `POST /v1/projects/{ref}/database/query/read-only` - run SQL query as `supabase_read_only_user`.

SQL body shape:
- `{"query":"select now()","parameters":[]}`
- The write-capable query endpoint also accepts optional `read_only`:
  `{"query":"select now()","parameters":[],"read_only":true}`
- For `/database/query/read-only`, entity references must be schema-qualified.

Example call (list organizations):

```bash
npx @jpbonch/ferrite use https://api.supabase.com/v1/organizations \
  --method GET \
  --header "accept:application/json"
```

Example call (list projects):

```bash
npx @jpbonch/ferrite use https://api.supabase.com/v1/projects \
  --method GET \
  --header "accept:application/json"
```

Example call (run SQL query; write-capable endpoint):

```bash
npx @jpbonch/ferrite use https://api.supabase.com/v1/projects/PROJECT_REF/database/query \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"query":"select now() as now","parameters":[]}'
```

Example call (run read-only SQL query):

```bash
npx @jpbonch/ferrite use https://api.supabase.com/v1/projects/PROJECT_REF/database/query/read-only \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"query":"select table_schema, table_name from information_schema.tables limit 10","parameters":[]}'
```

Docs:
- https://supabase.com/docs/reference/api/introduction
- https://supabase.com/docs/reference/api/v1-run-a-query
- https://supabase.com/docs/reference/api/v1-read-only-query
- https://supabase.com/docs/guides/integrations/build-a-supabase-oauth-integration
- https://supabase.com/docs/guides/integrations/build-a-supabase-oauth-integration/oauth-scopes
