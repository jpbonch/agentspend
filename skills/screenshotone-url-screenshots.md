---
name: "ScreenshotOne URL Screenshots"
description: "Generate screenshots and rendered captures from URLs."
domains:
  - "screenshotone.com"
source_url: "https://api.screenshotone.com/take"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/screenshotone-url-screenshots.md"
auth_type: "api_key"
icon_url: "https://screenshotone.com/favicon.ico"
---
## ScreenshotOne URL Screenshots

Primary endpoint: `https://api.screenshotone.com/take`

Auth:
- ScreenshotOne uses query auth: `access_key=<YOUR_KEY>`.
- Optional request signing uses `signature`.

Example:

```bash
npx @jpbonch/ferrite use "https://api.screenshotone.com/take?url=https://example.com&access_key=YOUR_SCREENSHOTONE_KEY&full_page=true" \
  --method GET
```

Docs:
- https://screenshotone.com/docs/options
- https://screenshotone.com/docs/signed-requests/
