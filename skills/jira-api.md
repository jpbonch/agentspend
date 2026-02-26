---
name: "Jira API"
description: "Connected Jira Cloud account APIs for projects, issues, and workflows."
domains:
  - "atlassian.net"
source_url: "https://your-site.atlassian.net/rest/api/3/project/search"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/jira-api.md"
auth_type: "oauth"
icon_url: "https://www.atlassian.com/favicon.ico"
---
## Jira API (OAuth)

`atlassian.net` (via Ferrite OAuth)

Description: Use your connected Jira Cloud account to call Jira REST APIs for projects, issues, and workflows.
Price: Provider/API dependent. Ferrite call cost depends on endpoint x402 policy.

OAuth behavior:
- Connect Jira in `ferrite configure` first.
- Do not send an `Authorization` header; Ferrite handles OAuth tokens.
- Replace `YOUR-SITE` with your Jira Cloud subdomain.

Headers you should set:
- `accept:application/json`.
- `content-type:application/json` for write operations (`POST`/`PUT`).

Body guidance:
- Issue create uses a `fields` object and often needs `project`, `summary`, and `issuetype`.
- Jira Cloud v3 rich text fields (description/comments) use Atlassian Document Format (ADF) JSON.
- JQL search supports query parameters or JSON body payloads for paging and field selection.

Common endpoints:
- `GET /rest/api/3/myself` - Get authenticated Jira user.
- `GET /rest/api/3/project/search` - List projects with pagination.
- `GET /rest/api/3/issue/{issueIdOrKey}` - Get issue details.
- `POST /rest/api/3/issue` - Create issue.
- `GET /rest/api/3/issue/{issueIdOrKey}/comment` - List comments.
- `POST /rest/api/3/issue/{issueIdOrKey}/comment` - Add comment.
- `POST /rest/api/3/search/jql` - Search issues with JQL.
- `GET /rest/api/3/issue/{issueIdOrKey}/transitions` - List transitions.
- `POST /rest/api/3/issue/{issueIdOrKey}/transitions` - Transition issue status.

Example call (current user):

```bash
npx ferrite use "https://YOUR-SITE.atlassian.net/rest/api/3/myself" \
  --method GET \
  --header "accept:application/json"
```

Example call (list projects):

```bash
npx ferrite use "https://YOUR-SITE.atlassian.net/rest/api/3/project/search" \
  --method GET \
  --header "accept:application/json"
```

Example call (search issues with JQL):

```bash
npx ferrite use "https://YOUR-SITE.atlassian.net/rest/api/3/search/jql" \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"jql":"project = ENG ORDER BY updated DESC","maxResults":25,"fields":["summary","status","assignee","updated"]}'
```

Example call (get issue):

```bash
npx ferrite use "https://YOUR-SITE.atlassian.net/rest/api/3/issue/ENG-123?fields=summary,status,assignee,description" \
  --method GET \
  --header "accept:application/json"
```

Example call (create issue):

```bash
npx ferrite use "https://YOUR-SITE.atlassian.net/rest/api/3/issue" \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"fields":{"project":{"key":"ENG"},"summary":"Ferrite created issue","issuetype":{"name":"Task"},"description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Created via Ferrite + Jira OAuth."}]}]}}}'
```

Example call (add issue comment):

```bash
npx ferrite use "https://YOUR-SITE.atlassian.net/rest/api/3/issue/ENG-123/comment" \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"body":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Comment from Ferrite."}]}]}}'
```

Example call (transition issue):

```bash
npx ferrite use "https://YOUR-SITE.atlassian.net/rest/api/3/issue/ENG-123/transitions" \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"transition":{"id":"31"}}'
```

Official docs:
- https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/
- https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-projects/
- https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/
- https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/
