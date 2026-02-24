---
name: "Weather Forecast"
description: "Get current weather and forecast data for a location."
domains:
  - "wttr.in"
source_url: "https://wttr.in"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/weather-forecast.md"
auth_type: "none"
icon_url: "https://wttr.in/favicon.ico"
---
## Weather Forecast

`https://wttr.in/{location}?format=j1`

Description: Get current weather and forecast data for a location.
Price: Usually free endpoint behavior; no x402 payment required for most calls.

Example call:

```bash
npx agentspend use "https://wttr.in/San%20Francisco?format=j1" \
  --method GET
```
