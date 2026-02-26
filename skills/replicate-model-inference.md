---
name: "Replicate Model Inference"
description: "Run and manage ML model predictions via Replicate HTTP API."
domains:
  - "replicate.com"
source_url: "https://api.replicate.com/v1/predictions"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/replicate-model-inference.md"
auth_type: "api_key"
icon_url: "https://replicate.com/favicon.ico"
---
## Replicate Model Inference

Primary endpoint: `https://api.replicate.com/v1/predictions`

Auth:
- Use `Authorization: Bearer <REPLICATE_API_TOKEN>`.

Common endpoints:
- `GET /v1/account`
- `GET /v1/predictions`
- `POST /v1/models/{owner}/{model}/predictions`

Example:

```bash
npx @jpbonch/ferrite use https://api.replicate.com/v1/models/replicate/hello-world/predictions \
  --method POST \
  --header "content-type:application/json" \
  --body '{"input":{"text":"hello from ferrite"}}'
```

Docs:
- https://replicate.com/docs/reference/http
