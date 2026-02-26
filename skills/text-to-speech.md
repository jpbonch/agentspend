---
name: "Text-to-Speech"
description: "Convert text input into spoken audio."
domains:
  - "x402factory.ai"
source_url: "https://x402factory.ai/base/tts"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/text-to-speech.md"
auth_type: "x402"
icon_url: "https://elevenlabs.io/favicon.ico"
---
### Text-to-Speech

`https://x402-gateway-production.up.railway.app/api/tts/elevenlabs`

Description: Premium text-to-speech with ElevenLabs. Ultra-realistic voices with multilingual support. Returns base64-encoded audio.
Price: $0.02 per request (published by x402engine docs).

Example call:

```bash
npx @jpbonch/ferrite use https://x402-gateway-production.up.railway.app/api/tts/elevenlabs \
  --method POST \
  --header "content-type:application/json" \
  --body '{"text":"Hello from Ferrite","voice_id":"21m00Tcm4TlvDq8ikWAM","format":"mp3_44100_128"}' 
```
