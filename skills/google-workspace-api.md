---
name: "Google Workspace API"
description: "Connected Google account APIs (Gmail, Drive, Calendar, and other Google Workspace endpoints)."
domains:
  - "googleapis.com"
source_url: "https://gmail.googleapis.com/gmail/v1/users/me/threads"
skill_url: "https://raw.githubusercontent.com/agentspend/agentspend/main/skills/google-workspace-api.md"
auth_type: "oauth"
icon_url: "https://www.google.com/favicon.ico"
---
## Google Workspace API (OAuth)

`googleapis.com` (via AgentSpend OAuth + Nango)

Description: Use your connected Google account to call Google Workspace APIs (for example Gmail, Drive, Calendar).
Price: Provider/API dependent. AgentSpend call cost depends on endpoint x402 policy.

OAuth behavior:
- Connect Google Workspace in `agentspend configure` first.
- Do not send an `Authorization` header; AgentSpend + Nango handles OAuth tokens.

Headers you should set:
- `accept:application/json` for JSON responses.
- `content-type:application/json` for `POST`/`PUT`/`PATCH` requests.

Body guidance:
- Gmail send (`users.messages.send`) expects a JSON body with `raw`, which is a Base64URL-encoded MIME message.
- Calendar event create/update expects `summary`, `start`, and `end` objects in JSON.
- Drive create/update endpoints accept JSON metadata bodies (and can support multipart uploads for file binaries).

Common endpoints:
- `GET https://gmail.googleapis.com/gmail/v1/users/me/profile` - Gmail profile.
- `GET https://gmail.googleapis.com/gmail/v1/users/me/messages` - List Gmail messages.
- `POST https://gmail.googleapis.com/gmail/v1/users/me/messages/send` - Send email.
- `GET https://www.googleapis.com/drive/v3/files` - List Drive files.
- `GET https://www.googleapis.com/drive/v3/files/{fileId}` - Get Drive file metadata.
- `GET https://www.googleapis.com/calendar/v3/users/me/calendarList` - List calendars.
- `GET https://www.googleapis.com/calendar/v3/calendars/primary/events` - List calendar events.
- `POST https://www.googleapis.com/calendar/v3/calendars/primary/events` - Create calendar event.
- `GET https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses` - Get my profile fields.
- `GET https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses` - List contacts.

Example call (Gmail messages list):

```bash
npx agentspend use "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q=newer_than:7d" \
  --method GET \
  --header "accept:application/json"
```

Example call (Gmail send):

```bash
npx agentspend use https://gmail.googleapis.com/gmail/v1/users/me/messages/send \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"raw":"RnJvbTogbWVAZXhhbXBsZS5jb20NClRvOiB0ZWFtQGV4YW1wbGUuY29tDQpTdWJqZWN0OiBUZXN0IGZyb20gQWdlbnRTcGVuZA0KDQpIZWxsbyBmcm9tIEFnZW50U3BlbmQu"}'
```

Example call (Drive files list):

```bash
npx agentspend use "https://www.googleapis.com/drive/v3/files?pageSize=25&fields=files(id,name,mimeType,modifiedTime)" \
  --method GET \
  --header "accept:application/json"
```

Example call (Calendar event list):

```bash
npx agentspend use "https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=2026-02-24T00:00:00Z" \
  --method GET \
  --header "accept:application/json"
```

Example call (Calendar create event):

```bash
npx agentspend use https://www.googleapis.com/calendar/v3/calendars/primary/events \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"summary":"AgentSpend sync","start":{"dateTime":"2026-02-25T16:00:00-05:00"},"end":{"dateTime":"2026-02-25T16:30:00-05:00"}}'
```

Example call (People connections list):

```bash
npx agentspend use "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,organizations&pageSize=50" \
  --method GET \
  --header "accept:application/json"
```

Official docs:
- https://developers.google.com/workspace/gmail/api/reference/rest
- https://developers.google.com/drive/api/reference/rest/v3
- https://developers.google.com/workspace/calendar/api/v3/reference
- https://developers.google.com/people/api/rest
