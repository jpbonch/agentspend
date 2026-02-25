---
name: "Deepgram Speech-to-Text"
description: "Transcription and speech understanding APIs."
domains:
  - "deepgram.com"
source_url: "https://api.deepgram.com/v1/listen"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/deepgram-speech-to-text.md"
auth_type: "api_key"
icon_url: "https://deepgram.com/favicon.ico"
---
## Deepgram Speech-to-Text

Primary endpoint: `https://api.deepgram.com/v1/listen`

Auth:
- Use `Authorization: Token <DEEPGRAM_API_KEY>`.

Example (URL-based transcription):

```bash
npx agentspend use "https://api.deepgram.com/v1/listen?model=nova-3&smart_format=true" \
  --method POST \
  --header "content-type:application/json" \
  --body '{"url":"https://dpgr.am/spacewalk.wav"}'
```

Docs:
- https://developers.deepgram.com/reference/authentication
