---
name: "Vercel API"
description: "Connected Vercel account APIs for projects, deployments, domains, and environment variables."
domains:
  - "api.vercel.com"
source_url: "https://api.vercel.com/v9/projects"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/vercel-api.md"
auth_type: "oauth"
icon_url: "https://vercel.com/favicon.ico"
---
## Vercel API (OAuth)

`api.vercel.com` (via Ferrite OAuth)

Description: Use your connected Vercel account to deploy and manage projects, deployments, domains, and environment variables.
Price: Provider/API dependent. Ferrite call cost depends on endpoint x402 policy.

OAuth behavior:
- Connect Vercel in `ferrite configure` first.
- Do not send an `Authorization` header; Ferrite injects OAuth tokens.

Team scoping guidance:
- For team-scoped resources, include `teamId=<TEAM_ID>` in query params.
- If `teamId` is omitted, Vercel applies your personal/default context.

Headers you should set:
- `accept:application/json`.
- `content-type:application/json` for write operations (`POST`/`PATCH`).

Core endpoints:
- `GET /v2/user` - Verify authenticated user/profile context.
- `GET /v9/projects` - List projects.
- `POST /v10/projects` - Create a project.
- `PATCH /v9/projects/{idOrName}` - Update project settings.
- `GET /v6/deployments` - List deployments.
- `GET /v13/deployments/{idOrUrl}` - Get deployment details.
- `POST /v13/deployments` - Create a deployment.
- `PATCH /v13/deployments/{id}/cancel` - Cancel an in-progress deployment.
- `POST /v10/projects/{idOrName}/domains` - Add a domain to a project.
- `DELETE /v9/projects/{idOrName}/domains/{domain}` - Remove a domain from a project.
- `GET /v10/projects/{idOrName}/env` - List environment variables.
- `POST /v10/projects/{idOrName}/env` - Create environment variables.
- `PATCH /v10/projects/{idOrName}/env/{id}` - Update an environment variable.

Example call (read: list projects):

```bash
npx @jpbonch/ferrite use "https://api.vercel.com/v9/projects?limit=20&teamId=TEAM_ID" \
  --method GET \
  --header "accept:application/json"
```

Example call (mutation: create project):

```bash
npx @jpbonch/ferrite use "https://api.vercel.com/v10/projects?teamId=TEAM_ID" \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"name":"ferrite-vercel-sample","framework":"nextjs"}'
```

Example call (mutation: create env var):

```bash
npx @jpbonch/ferrite use "https://api.vercel.com/v10/projects/PROJECT_NAME/env?upsert=true&teamId=TEAM_ID" \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '[{"key":"API_BASE_URL","value":"https://example.com","target":["production","preview"],"type":"encrypted"}]'
```

Official docs:
- https://vercel.com/docs/integrations/oauth2-overview
- https://vercel.com/docs/integrations/scopes-permissions
- https://vercel.com/docs/rest-api/reference/endpoints/projects/retrieve-a-list-of-projects
- https://vercel.com/docs/rest-api/reference/endpoints/projects/create-a-new-project
- https://vercel.com/docs/rest-api/reference/endpoints/projects/edit-an-existing-project
- https://vercel.com/docs/rest-api/reference/endpoints/deployments/create-a-new-deployment
- https://vercel.com/docs/rest-api/reference/endpoints/deployments/get-a-deployment-by-id-or-url
- https://vercel.com/docs/rest-api/reference/endpoints/projects/add-a-domain-to-a-project
- https://vercel.com/docs/rest-api/reference/endpoints/projects/create-one-or-more-environment-variables
