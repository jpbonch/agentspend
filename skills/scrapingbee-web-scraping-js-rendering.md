---
name: "ScrapingBee Web Scraping"
description: "Web scraping with JavaScript rendering, proxies, and anti-bot tooling."
domains:
  - "scrapingbee.com"
source_url: "https://app.scrapingbee.com/api/v1"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/scrapingbee-web-scraping-js-rendering.md"
auth_type: "api_key"
icon_url: "https://www.scrapingbee.com/favicon.ico"
---
## ScrapingBee Web Scraping

Primary endpoint: `https://app.scrapingbee.com/api/v1`

Auth:
- ScrapingBee uses query auth: `api_key=<YOUR_KEY>`.
- This is query-parameter auth, not header auth.

Example:

```bash
npx @jpbonch/ferrite use "https://app.scrapingbee.com/api/v1?api_key=YOUR_SCRAPINGBEE_KEY&url=https%3A%2F%2Fexample.com&render_js=true" \
  --method GET
```

Docs:
- https://www.scrapingbee.com/documentation/
