---
name: "Stability AI Image Generation"
description: "Generate and transform images with Stability AI REST endpoints."
domains:
  - "stability.ai"
source_url: "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/stability-ai-image-generation.md"
auth_type: "api_key"
icon_url: "https://stability.ai/favicon.ico"
---
## Stability AI Image Generation

Primary endpoint: `https://api.stability.ai/v1/generation/{engine_id}/text-to-image`

Auth:
- Use `Authorization: Bearer <STABILITY_API_KEY>`.

Common endpoints:
- `GET /v1/user/account`
- `GET /v1/user/balance`
- `POST /v1/generation/{engine_id}/text-to-image`

Example:

```bash
npx ferrite use https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image \
  --method POST \
  --header "content-type:application/json" \
  --header "accept:application/json" \
  --body '{"text_prompts":[{"text":"cinematic photo of a neon-lit city at night"}],"height":1024,"width":1024,"samples":1}'
```

Docs:
- https://staging-api.stability.ai/docs
