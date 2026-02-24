---
name: "Speech-to-Text"
description: "Transcribe spoken audio into text."
domains:
  - "x402factory.ai"
source_url: "https://x402factory.ai/base/stt"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/speech-to-text.md"
auth_type: "x402"
icon_url: "https://x402factory.ai/favicon.ico"
---
### Speech-to-Text

`https://x402factory.ai/base/stt`

Description: Transcribe spoken audio into text.
Price: Variable by audio duration. x402Factory publishes `$0.01 per started minute` (default discovery quote without concrete URL: $0.60).

Example call:

```bash
npx agentspend use https://x402factory.ai/base/stt \
  --method POST \
  --header "content-type:application/json" \
  --body '{"audioUrl":"https://example.com/audio.wav"}' 
```
