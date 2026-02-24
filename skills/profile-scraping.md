---
name: "Profile Scraping"
description: "Pull profile details from a LinkedIn profile URL."
domains:
  - "stableenrich.dev"
source_url: "https://stableenrich.dev/api/clado/linkedin-scrape"
skill_url: "https://raw.githubusercontent.com/agentspend/agentspend/main/skills/profile-scraping.md"
auth_type: "x402"
icon_url: "https://www.linkedin.com/favicon.ico"
---
### Clado LinkedIn Profile Scraping

`https://stableenrich.dev/api/clado/linkedin-scrape`

Description: Pull detailed profile data from a LinkedIn profile URL.
Price: $0.04 per request (published).

Headers:
- `content-type:application/json`

Body guidance:
- `linkedin_url` (string, required): full public LinkedIn profile URL.

When to use:
- Use as a fallback when Apollo enrichment does not return enough detail.
- Useful for detailed profile sections (experience, education, skills, posts).

Related StableEnrich endpoints:
- `POST /api/clado/contacts-enrich` (email/phone/linkedin_url lookup; provide exactly one identifier)
- `POST /api/apollo/people-enrich`

Example call (profile scrape):

```bash
npx agentspend use https://stableenrich.dev/api/clado/linkedin-scrape \
  --method POST \
  --header "content-type:application/json" \
  --body '{"linkedin_url":"https://www.linkedin.com/in/satyanadella"}'
```

Example call (contact enrich fallback):

```bash
npx agentspend use https://stableenrich.dev/api/clado/contacts-enrich \
  --method POST \
  --header "content-type:application/json" \
  --body '{"linkedin_url":"https://www.linkedin.com/in/satyanadella"}'
```

Docs:
- https://stableenrich.dev/llms.txt
- https://stableenrich.dev/docs
