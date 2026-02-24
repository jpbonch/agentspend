---
name: "GitHub API"
description: "Connected GitHub account APIs for repositories, issues, pull requests, and user resources."
domains:
  - "github.com"
source_url: "https://api.github.com/user/repos"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/github-api.md"
auth_type: "oauth"
icon_url: "https://github.com/favicon.ico"
---
## GitHub API (OAuth)

`github.com` (via AgentSpend OAuth + Nango)

Description: Use your connected GitHub account to call GitHub REST APIs (repos, issues, pulls, users, etc).
Price: Provider/API dependent. AgentSpend call cost depends on endpoint x402 policy.

OAuth behavior:
- Connect GitHub in `agentspend configure` first.
- Do not send an `Authorization` header; AgentSpend + Nango handles OAuth tokens.

Headers you should set:
- `accept:application/vnd.github+json` for GitHub REST media type.
- `x-github-api-version:2022-11-28` for stable versioning.
- `content-type:application/json` for `POST`/`PUT`/`PATCH`.

Body guidance:
- Create/update endpoints expect JSON request bodies.
- For file writes (`PUT /repos/{owner}/{repo}/contents/{path}`), `content` must be Base64 and `sha` is required when updating an existing file.

Common endpoints:
- `GET /user` - Get authenticated user profile.
- `GET /user/repos` - List repos visible to authenticated user.
- `GET /repos/{owner}/{repo}/branches` - List branches.
- `GET /repos/{owner}/{repo}/commits` - List recent commits.
- `GET /repos/{owner}/{repo}/issues` - List repository issues.
- `POST /repos/{owner}/{repo}/issues` - Create an issue.
- `GET /repos/{owner}/{repo}/pulls` - List pull requests.
- `POST /repos/{owner}/{repo}/pulls` - Create a pull request.
- `GET /repos/{owner}/{repo}/actions/runs` - List GitHub Actions workflow runs.
- `GET /repos/{owner}/{repo}/contents/{path}` - Read file/directory content.
- `PUT /repos/{owner}/{repo}/contents/{path}` - Create/update a file.

Example call (authenticated user):

```bash
npx agentspend use https://api.github.com/user \
  --method GET \
  --header "accept:application/vnd.github+json" \
  --header "x-github-api-version:2022-11-28"
```

Example call (my repos):

```bash
npx agentspend use https://api.github.com/user/repos \
  --method GET \
  --header "accept:application/vnd.github+json" \
  --header "x-github-api-version:2022-11-28"
```

Example call (list repo pull requests):

```bash
npx agentspend use https://api.github.com/repos/OWNER/REPO/pulls?state=open&per_page=20 \
  --method GET \
  --header "accept:application/vnd.github+json" \
  --header "x-github-api-version:2022-11-28"
```

Example call (list workflow runs):

```bash
npx agentspend use https://api.github.com/repos/OWNER/REPO/actions/runs?per_page=20 \
  --method GET \
  --header "accept:application/vnd.github+json" \
  --header "x-github-api-version:2022-11-28"
```

Example call (create issue):

```bash
npx agentspend use https://api.github.com/repos/OWNER/REPO/issues \
  --method POST \
  --header "accept:application/vnd.github+json" \
  --header "content-type:application/json" \
  --header "x-github-api-version:2022-11-28" \
  --body '{"title":"Bug: checkout fails","body":"Steps to reproduce...","labels":["bug"]}'
```

Example call (create pull request):

```bash
npx agentspend use https://api.github.com/repos/OWNER/REPO/pulls \
  --method POST \
  --header "accept:application/vnd.github+json" \
  --header "content-type:application/json" \
  --header "x-github-api-version:2022-11-28" \
  --body '{"title":"feat: add export endpoint","head":"feature/export-endpoint","base":"main","body":"Implements export endpoint."}'
```

Example call (read file content):

```bash
npx agentspend use https://api.github.com/repos/OWNER/REPO/contents/README.md \
  --method GET \
  --header "accept:application/vnd.github+json" \
  --header "x-github-api-version:2022-11-28"
```

Example call (create/update file content):

```bash
npx agentspend use https://api.github.com/repos/OWNER/REPO/contents/notes/hello.txt \
  --method PUT \
  --header "accept:application/vnd.github+json" \
  --header "content-type:application/json" \
  --header "x-github-api-version:2022-11-28" \
  --body '{"message":"chore: add hello note","content":"SGVsbG8gZnJvbSBBZ2VudFNwZW5kCg==","branch":"main"}'
```

Official docs:
- https://docs.github.com/en/rest
- https://docs.github.com/en/rest/issues/issues
- https://docs.github.com/en/rest/reference/pulls
- https://docs.github.com/en/rest/repos/contents
