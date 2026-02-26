---
name: "Microsoft Graph API"
description: "Outlook Mail, Calendar, Files, Teams chat, contacts, To-Do tasks, and OneNote."
domains:
  - "graph.microsoft.com"
source_url: "https://graph.microsoft.com/v1.0/me"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/microsoft-graph-api.md"
auth_type: "oauth"
icon_url: "https://www.microsoft.com/favicon.ico"
---
## Microsoft Graph API (OAuth)

`graph.microsoft.com` (via Ferrite OAuth)

Description: Use your connected Microsoft account to call Microsoft Graph APIs for Outlook mail/calendar, OneDrive and SharePoint files, Teams chats/channels, contacts, To-Do tasks, and OneNote.
Price: Provider/API dependent. Ferrite call cost depends on endpoint x402 policy.

OAuth behavior:
- Connect Microsoft in `ferrite configure` first.
- Do not send an `Authorization` header; Ferrite injects OAuth tokens.
- These are delegated scopes, so actions run as the signed-in user.
- `offline_access` allows refresh tokens so the connection can stay active.

Headers you should set:
- `accept:application/json`.
- `content-type:application/json` for write operations (`POST`/`PATCH`/`PUT`).

Granted delegated scopes in this provider:
- `Calendars.ReadWrite` - full access to user calendars.
- `ChannelMessage.Send` - send Teams channel messages.
- `Chat.ReadWrite` - read and write Teams chats.
- `ChatMessage.Read` - read Teams chat messages.
- `ChatMessage.Send` - send Teams chat messages.
- `Contacts.Read` - read Outlook contacts.
- `email` - read primary email claim.
- `Files.ReadWrite.All` - read/write files user can access.
- `Mail.ReadWrite` - read/write mailbox data.
- `Mail.Send` - send mail as user.
- `Notes.ReadWrite.All` - read/write OneNote notebooks user can access.
- `offline_access` - allow refresh tokens.
- `openid` - OpenID Connect sign-in.
- `profile` - basic profile claims.
- `Tasks.ReadWrite` - create/read/update/delete tasks and task lists.
- `User.Read` - sign in and read user profile.

Capability guide by scope:
- Identity and profile (`User.Read`, `openid`, `profile`, `email`): `GET /v1.0/me`.
- Mailbox (`Mail.ReadWrite`, `Mail.Send`): list/read/update mail, create drafts, send mail.
- Calendar (`Calendars.ReadWrite`): list/create/update/delete events.
- Contacts (`Contacts.Read`): read contacts and contact folders.
- Files (`Files.ReadWrite.All`): read/write OneDrive or SharePoint files user can access.
- Tasks (`Tasks.ReadWrite`): manage Microsoft To Do lists and tasks.
- OneNote (`Notes.ReadWrite.All`): read/write notebooks, sections, pages.
- Teams chat (`Chat.ReadWrite`, `ChatMessage.Read`, `ChatMessage.Send`): list chats, read/send chat messages.
- Teams channels (`ChannelMessage.Send`): send messages to channels when team/channel IDs are known.

Important Teams note:
- `ChannelMessage.Send` is send-focused; it does not grant broad channel/team discovery by itself.
- If discovery/list endpoints fail due permissions, provide explicit `team-id` and `channel-id`, or add extra read scopes in Azure if needed.

Common endpoints:
- `GET https://graph.microsoft.com/v1.0/me` - Signed-in profile.
- `GET https://graph.microsoft.com/v1.0/me/messages?$top=25` - List mail.
- `PATCH https://graph.microsoft.com/v1.0/me/messages/{message-id}` - Update message fields.
- `POST https://graph.microsoft.com/v1.0/me/sendMail` - Send mail.
- `GET https://graph.microsoft.com/v1.0/me/events` - List events.
- `POST https://graph.microsoft.com/v1.0/me/events` - Create event.
- `GET https://graph.microsoft.com/v1.0/me/contacts` - List contacts.
- `GET https://graph.microsoft.com/v1.0/me/drive/root/children` - List files.
- `PUT https://graph.microsoft.com/v1.0/me/drive/root:/PATH/filename.txt:/content` - Upload/replace file content.
- `GET https://graph.microsoft.com/v1.0/me/todo/lists` - List task lists.
- `POST https://graph.microsoft.com/v1.0/me/todo/lists/{list-id}/tasks` - Create task.
- `GET https://graph.microsoft.com/v1.0/me/onenote/notebooks` - List notebooks.
- `POST https://graph.microsoft.com/v1.0/chats/{chat-id}/messages` - Send chat message.
- `POST https://graph.microsoft.com/v1.0/teams/{team-id}/channels/{channel-id}/messages` - Send channel message.

Example call (profile):

```bash
npx @jpbonch/ferrite use https://graph.microsoft.com/v1.0/me \
  --method GET \
  --header "accept:application/json"
```

Example call (read mail):

```bash
npx @jpbonch/ferrite use "https://graph.microsoft.com/v1.0/me/messages?$top=25&$select=id,subject,from,receivedDateTime,isRead" \
  --method GET \
  --header "accept:application/json"
```

Example call (mark mail as read):

```bash
npx @jpbonch/ferrite use https://graph.microsoft.com/v1.0/me/messages/MESSAGE_ID \
  --method PATCH \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"isRead":true}'
```

Example call (send mail):

```bash
npx @jpbonch/ferrite use https://graph.microsoft.com/v1.0/me/sendMail \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"message":{"subject":"Hello from Ferrite","body":{"contentType":"Text","content":"Hi team"},"toRecipients":[{"emailAddress":{"address":"team@example.com"}}]},"saveToSentItems":true}'
```

Example call (create calendar event):

```bash
npx @jpbonch/ferrite use https://graph.microsoft.com/v1.0/me/events \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"subject":"Ferrite sync","start":{"dateTime":"2026-02-25T16:00:00","timeZone":"America/New_York"},"end":{"dateTime":"2026-02-25T16:30:00","timeZone":"America/New_York"}}'
```

Example call (list contacts):

```bash
npx @jpbonch/ferrite use "https://graph.microsoft.com/v1.0/me/contacts?$top=50&$select=id,displayName,emailAddresses" \
  --method GET \
  --header "accept:application/json"
```

Example call (upload file to OneDrive):

```bash
npx @jpbonch/ferrite use "https://graph.microsoft.com/v1.0/me/drive/root:/Notes/ferrite.txt:/content" \
  --method PUT \
  --header "content-type:text/plain" \
  --body "Created from Ferrite"
```

Example call (create To Do task):

```bash
npx @jpbonch/ferrite use https://graph.microsoft.com/v1.0/me/todo/lists/LIST_ID/tasks \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"title":"Follow up with customer","dueDateTime":{"dateTime":"2026-03-01T18:00:00","timeZone":"UTC"}}'
```

Example call (list OneNote notebooks):

```bash
npx @jpbonch/ferrite use https://graph.microsoft.com/v1.0/me/onenote/notebooks \
  --method GET \
  --header "accept:application/json"
```

Example call (send Teams chat message):

```bash
npx @jpbonch/ferrite use https://graph.microsoft.com/v1.0/chats/CHAT_ID/messages \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"body":{"content":"Sent from Ferrite"}}'
```

Example call (send Teams channel message):

```bash
npx @jpbonch/ferrite use https://graph.microsoft.com/v1.0/teams/TEAM_ID/channels/CHANNEL_ID/messages \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"body":{"contentType":"html","content":"<p>Sent from Ferrite</p>"}}'
```

Official docs:
- https://learn.microsoft.com/graph/api/overview
- https://learn.microsoft.com/graph/permissions-reference
- https://learn.microsoft.com/graph/auth-v2-user
- https://learn.microsoft.com/graph/api/resources/mail-api-overview
- https://learn.microsoft.com/graph/api/resources/onedrive
- https://learn.microsoft.com/graph/api/resources/teams-api-overview
- https://learn.microsoft.com/graph/api/resources/onenote-api-overview
- https://learn.microsoft.com/graph/api/resources/todo-overview
