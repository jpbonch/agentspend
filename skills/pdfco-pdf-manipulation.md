---
name: "PDF.co PDF Manipulation"
description: "Convert, parse, split, merge, and automate PDF operations."
domains:
  - "pdf.co"
source_url: "https://api.pdf.co/v1/pdf/convert/to/csv"
skill_url: "https://raw.githubusercontent.com/jpbonch/agentspend/main/skills/pdfco-pdf-manipulation.md"
auth_type: "api_key"
icon_url: "https://pdf.co/favicon.ico"
---
## PDF.co PDF Manipulation

Primary endpoint family: `https://api.pdf.co/v1/...`

Auth:
- Use header `x-api-key: <PDFCO_API_KEY>`.

Example:

```bash
npx agentspend use https://api.pdf.co/v1/pdf/convert/to/csv \
  --method POST \
  --header "content-type:application/json" \
  --body '{"url":"https://pdfco-test-files.s3.us-west-2.amazonaws.com/pdf-to-csv/sample.pdf","inline":true}'
```

Docs:
- https://docs.pdf.co/api-reference/introduction
