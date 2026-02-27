---
name: "Twilio SMS & Voice API"
description: "Send SMS and place outbound phone calls through Twilio REST APIs."
domains:
  - "api.twilio.com"
source_url: "https://www.twilio.com/docs/messaging/api/message-resource#create-a-message-resource"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/twilio-sms-voice-api.md"
auth_type: "api_key"
icon_url: "https://www.twilio.com/favicon.ico"
---
## Twilio SMS & Voice API

Base URL: `https://api.twilio.com`

Auth behavior:
- Ferrite injects `Authorization: Basic <base64(apiKeySid:apiKeySecret)>` for `api.twilio.com`.
- Configure the domain key in Ferrite Cloud with:
  `PUT /internal/domain-api-keys/api.twilio.com`
- Do not include your own `Authorization` header unless you intentionally want to override platform auth.

Request format:
- Twilio create/update endpoints commonly use form-encoded bodies.
- Set `content-type:application/x-www-form-urlencoded`.
- Pass URL-encoded key/value pairs in `--body` (string form), not JSON.

Core endpoints:
- `GET /2010-04-01/Accounts/{AccountSid}/Messages.json` - list messages.
- `POST /2010-04-01/Accounts/{AccountSid}/Messages.json` - send SMS/MMS.
- `GET /2010-04-01/Accounts/{AccountSid}/Calls.json` - list calls.
- `POST /2010-04-01/Accounts/{AccountSid}/Calls.json` - create an outbound call.

Parameter guidance:
- Send SMS:
  - Required: `To`
  - Required: one of `From` or `MessagingServiceSid`
  - Required: one of `Body`, `MediaUrl`, or `ContentSid`
- Create call:
  - Required: `To`
  - Required: `From`
  - Required: one of `Url`, `Twiml`, or `ApplicationSid`

Example call (safe read, list recent messages):

```bash
npx @jpbonch/ferrite use "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json?PageSize=1" \
  --method GET \
  --header "accept:application/json"
```

Example call (send SMS):

```bash
npx @jpbonch/ferrite use "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
  --method POST \
  --header "content-type:application/x-www-form-urlencoded" \
  --body "To=%2B15551234567&From=%2B15557654321&Body=Hello%20from%20Ferrite"
```

Example call (create outbound call):

```bash
npx @jpbonch/ferrite use "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Calls.json" \
  --method POST \
  --header "content-type:application/x-www-form-urlencoded" \
  --body "To=%2B15551234567&From=%2B15557654321&Url=https%3A%2F%2Fdemo.twilio.com%2Fwelcome%2Fvoice%2F"
```

Docs:
- https://www.twilio.com/docs/usage/requests-to-twilio
- https://www.twilio.com/docs/messaging/api/message-resource
- https://www.twilio.com/docs/voice/api/call-resource
