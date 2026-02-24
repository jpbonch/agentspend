---
name: "File Storage Upload (Public URL output)"
description: "Upload/store a file and get back a hosted public URL."
domains:
  - "pylon-file-storage-api.fly.dev"
source_url: "https://pylon-file-storage-api.fly.dev/upload"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/file-storage-upload-public-url-output.md"
auth_type: "x402"
icon_url: "https://pylon-file-storage-api.fly.dev/favicon.ico"
---
## File Storage Upload (Public URL output)

`https://pylon-file-storage-api.fly.dev/upload`

Description: Upload a file (multipart) or fetch from URL and return a public file URL.
Price: $0.005 per upload (published).

Example call (upload from URL):

```bash
npx agentspend use https://pylon-file-storage-api.fly.dev/upload \
  --method POST \
  --header "content-type:application/json" \
  --body '{"url":"https://example.com/report.pdf","filename":"report.pdf"}'
```

Notes:
- Max file size: 50MB.
- Files expire after 30 days.
- For binary local files, use multipart/form-data from your own client workflow.
