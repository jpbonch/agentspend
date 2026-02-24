---
name: "Video Generation (High Quality)"
description: "Premium video generation with advanced quality and smoother motion."
domains:
  - "x402-gateway-production.up.railway.app"
source_url: "https://x402-gateway-production.up.railway.app/api/video/quality"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/video-generation-high-quality.md"
auth_type: "x402"
icon_url: "https://openai.com/favicon.ico"
---
### Video Generation (High Quality)

`https://x402-gateway-production.up.railway.app/api/video/quality`

Description: Premium video generation with advanced quality and smoother motion.
Price: $0.50 per request (published by x402engine).

Headers:
- `content-type:application/json`

Body guidance:
- `prompt` (string, required)
- `duration` (string, optional: `"5"` or `"10"`, default `"5"`)
- `aspect_ratio` (string, optional: `"16:9"`, `"9:16"`, `"1:1"`, default `"16:9"`)
- `negative_prompt` (string, optional)

Response note:
- Gateway responses include `video.url` for the generated MP4 file.

Related x402engine endpoints:
- `POST /api/video/fast` ($0.30)
- `POST /api/video/hailuo` ($0.60, 1080p)
- `POST /api/video/animate` ($0.50, image-to-video; requires `image_url`)

Example call (quality video):

```bash
npx agentspend use https://x402-gateway-production.up.railway.app/api/video/quality \
  --method POST \
  --header "content-type:application/json" \
  --body '{"prompt":"cinematic drone shot over neon city at night","duration":"5","aspect_ratio":"16:9"}'
```

Example call (quality video with negative prompt):

```bash
npx agentspend use https://x402-gateway-production.up.railway.app/api/video/quality \
  --method POST \
  --header "content-type:application/json" \
  --body '{"prompt":"product reveal on rotating pedestal, studio lighting","duration":"10","aspect_ratio":"1:1","negative_prompt":"blur, low quality, distortion"}'
```

Example call (image-to-video animate):

```bash
npx agentspend use https://x402-gateway-production.up.railway.app/api/video/animate \
  --method POST \
  --header "content-type:application/json" \
  --body '{"prompt":"the subject smiles and turns toward camera","image_url":"https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=512","duration":"5","aspect_ratio":"16:9"}'
```

Docs:
- https://x402-gateway-production.up.railway.app/.well-known/x402.json
- https://x402-gateway-production.up.railway.app/llms.txt
- https://x402-gateway-production.up.railway.app/docs
