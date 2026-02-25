---
name: "Image Generation (High Quality)"
description: "Premium image generation with enhanced quality and detail from a text prompt."
domains:
  - "x402-gateway-production.up.railway.app"
source_url: "https://x402-gateway-production.up.railway.app/api/image/quality"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/image-generation-high-quality.md"
auth_type: "x402"
icon_url: "https://openai.com/favicon.ico"
---
### Image Generation (High Quality)

`https://x402-gateway-production.up.railway.app/api/image/quality`

Description: Premium image generation with enhanced quality and detail from a text prompt.
Price: $0.05 per request (published by x402engine).

Headers:
- `content-type:application/json`

Body guidance:
- `prompt` (string, required)
- `width` (number, optional, 256-2048, default 1024)
- `height` (number, optional, 256-2048, default 1024)
- `seed` (number, optional, reproducibility)

Related x402engine endpoints:
- `POST /api/image/fast` ($0.015, draft/fast mode)
- `POST /api/image/text` ($0.12, better text rendering)

Example call (quality image):

```bash
npx ferrite use https://x402-gateway-production.up.railway.app/api/image/quality \
  --method POST \
  --header "content-type:application/json" \
  --body '{"prompt":"minimal black and white logo of a coin with a lightning bolt","width":1024,"height":1024}'
```

Example call (quality image with seed):

```bash
npx ferrite use https://x402-gateway-production.up.railway.app/api/image/quality \
  --method POST \
  --header "content-type:application/json" \
  --body '{"prompt":"cinematic portrait of a founder in a modern office","width":1536,"height":1024,"seed":42}'
```

Example call (text-in-image variant):

```bash
npx ferrite use https://x402-gateway-production.up.railway.app/api/image/text \
  --method POST \
  --header "content-type:application/json" \
  --body '{"prompt":"poster design with the text \"FERRITE\" in bold sans-serif","image_size":"square"}'
```

Docs:
- https://x402-gateway-production.up.railway.app/.well-known/x402.json
- https://x402-gateway-production.up.railway.app/llms.txt
- https://x402-gateway-production.up.railway.app/docs
