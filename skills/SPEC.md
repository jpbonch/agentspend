# Skills Spec

Each skill file listed in [`manifest.json`](./manifest.json) must be a Markdown file with YAML frontmatter at the top.

## Frontmatter format

```yaml
---
name: "Skill name"
description: "What this skill does"
domains:
  - "example.com"
source_url: "https://example.com/api/endpoint"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/your-skill.md"
auth_type: "none"
execution_mode: "http"
icon_url: "https://example.com/icon.png"
---
```

## Required fields

- `name` (string)
- `description` (string)
- `domains` (array of one or more domains)
- `skill_url` (https URL)
- `auth_type` (string)
- `icon_url` (https URL)

## Optional fields

- `source_url` (https URL)
- `execution_mode` (string)

## Notes

- Only the frontmatter is structured. The body of the skill file can use any Markdown format.
- `manifest.json` is the source of truth for which `.md` files are included.
- Recommended `execution_mode` values:
  - `http`: HTTP/API-first workflow.
  - `cli`: local CLI-first workflow.
  - `hybrid_cli`: mixed workflow where CLI steps are local but payment/auth HTTP calls remain explicit.
- Recommended `auth_type` values:
  - `none`: no upstream auth injected by Ferrite.
  - `oauth`: Ferrite-managed OAuth connection flow.
  - `api_key`: platform-managed domain API key (configured server-side, not in the skill file).
  - `x402`: micropayment-authenticated endpoint.
