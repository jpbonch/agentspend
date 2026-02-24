---
name: "Slack API"
description: "Connected Slack workspace APIs for channels, messages, users, and conversations."
domains:
  - "slack.com"
source_url: "https://slack.com/api/conversations.list"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/slack-api.md"
auth_type: "oauth"
icon_url: "https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png"
---
## Slack API (OAuth)

`slack.com` (via AgentSpend OAuth + Nango)

Description: Use your connected Slack workspace APIs for channels, conversations, users, and messages.
Price: Provider/API dependent. AgentSpend call cost depends on endpoint x402 policy.

OAuth behavior:
- Connect Slack in `agentspend configure` first.
- Do not send an `Authorization` header; AgentSpend + Nango handles OAuth tokens.

Headers you should set:
- `accept:application/json` for JSON responses.
- `content-type:application/json` for methods where you send a JSON body.
- Some legacy methods accept `application/x-www-form-urlencoded`; use that if a specific method rejects JSON.

Body guidance:
- `chat.postMessage` and `chat.update` require `channel`, plus `text` or `blocks`.
- Conversation history/replies need IDs in params (`channel`, `ts`, `latest`, `oldest`).
- Slack Web API methods are typically called with `POST` to `https://slack.com/api/{method}`.
- Slack responses include `ok`; treat `ok: false` with `error` as a failed API call.

Common endpoints:
- `POST /api/auth.test` - Validate token/workspace identity.
- `POST /api/conversations.list` - List public/private channels the app can access.
- `POST /api/conversations.history` - Get channel message history.
- `POST /api/conversations.replies` - Get thread replies.
- `POST /api/chat.postMessage` - Send message to a channel.
- `POST /api/chat.update` - Edit an existing message.
- `POST /api/users.list` - List workspace users.
- `POST /api/users.info` - Get one user by ID.
- `POST /api/reactions.add` - Add emoji reaction to a message.

Example call (auth test):

```bash
npx agentspend use https://slack.com/api/auth.test \
  --method POST \
  --header "content-type:application/json" \
  --header "accept:application/json"
```

Example call (list channels):

```bash
npx agentspend use https://slack.com/api/conversations.list \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"types":"public_channel,private_channel","limit":100}'
```

Example call (channel history):

```bash
npx agentspend use https://slack.com/api/conversations.history \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"channel":"C12345678","limit":50}'
```

Example call (post message):

```bash
npx agentspend use https://slack.com/api/chat.postMessage \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"channel":"C12345678","text":"Hello from AgentSpend"}'
```

Example call (reply in thread):

```bash
npx agentspend use https://slack.com/api/chat.postMessage \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"channel":"C12345678","thread_ts":"1734902400.001200","text":"Follow-up in thread"}'
```

Example call (lookup a user):

```bash
npx agentspend use https://slack.com/api/users.info \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/json" \
  --body '{"user":"U12345678"}'
```

Official docs:
- https://api.slack.com/web
- https://docs.slack.dev/reference/methods/conversations.list
- https://docs.slack.dev/reference/methods/conversations.history
- https://docs.slack.dev/reference/methods/chat.postMessage
- https://docs.slack.dev/reference/methods/users.info
