---
name: "OpenRouter LLM API"
description: "Unified chat and response APIs across multiple model providers through OpenRouter."
domains:
  - "openrouter.ai"
source_url: "https://openrouter.ai/api/v1/chat/completions"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/openrouter-llm-api.md"
auth_type: "api_key"
icon_url: "https://openrouter.ai/favicon.ico"
---
## OpenRouter LLM API

Base URL: `https://openrouter.ai/api/v1`

Auth behavior:
- Ferrite injects `Authorization: Bearer <OPENROUTER_API_KEY>` for `openrouter.ai`.
- You can add `HTTP-Referer` and `X-Title` headers for app attribution/ranking in OpenRouter.

Common endpoints:
- `POST /chat/completions` - OpenAI-compatible chat completions.
- `POST /responses` - OpenAI Responses-style API.
- `GET /models` - List available models and metadata.
- `GET /models/{author}/{slug}/endpoints` - Provider endpoint coverage for a model.
- `GET /key` - Current API key metadata and limits.
- `GET /generation?id=<generation_id>` - Inspect a generation by ID.

Example call (chat completion):

```bash
npx ferrite use https://openrouter.ai/api/v1/chat/completions \
  --method POST \
  --header "content-type:application/json" \
  --header "http-referer:https://example.com" \
  --header "x-title:Ferrite OpenRouter Skill" \
  --body '{"model":"openai/gpt-4o-mini","messages":[{"role":"system","content":"You are concise."},{"role":"user","content":"Summarize retrieval-augmented generation in 3 bullets."}]}'
```

Example call (responses API):

```bash
npx ferrite use https://openrouter.ai/api/v1/responses \
  --method POST \
  --header "content-type:application/json" \
  --body '{"model":"openai/gpt-4o-mini","input":"Write a 4-line poem about distributed systems.","stream":false}'
```

Example call (list models):

```bash
npx ferrite use https://openrouter.ai/api/v1/models \
  --method GET
```

Example call (inspect your key metadata):

```bash
npx ferrite use https://openrouter.ai/api/v1/key \
  --method GET
```

Docs:
- https://openrouter.ai/docs/api/reference/overview
- https://openrouter.ai/docs/api/reference/authentication
- https://openrouter.ai/docs/api/reference/parameters
- https://openrouter.ai/docs/api/reference/responses/overview
- https://openrouter.ai/docs/quickstart
- https://openrouter.ai/openapi.json
