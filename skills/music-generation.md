---
name: "Music Generation"
description: "Generate music/audio from a prompt."
domains:
  - "x402factory.ai"
source_url: "https://x402factory.ai/base/music"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/music-generation.md"
auth_type: "x402"
icon_url: "https://x402factory.ai/favicon.ico"
---
### Music Generation

`https://x402factory.ai/base/music`

Description: Generate music/audio from a prompt.
Price: $0.02 per second

Example call:

```bash
npx agentspend use https://x402factory.ai/base/music \
  --method POST \
  --header "content-type:application/json" \
  --body '{"prompt":"ambient synthwave for coding focus"}' 
```
