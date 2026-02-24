import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(currentFile), "..");
const skillsDir = path.join(repoRoot, "skills");
const manifestPath = path.join(skillsDir, "manifest.json");
const SKILL_URL_PREFIX = "https://raw.githubusercontent.com/agentspend/agentspend/main/skills/";

function fail(message) {
  console.error(`[skills:validate] ${message}`);
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function parseFrontmatter(content) {
  if (!content.startsWith("---\n")) {
    return null;
  }

  const closingIndex = content.indexOf("\n---\n", 4);
  if (closingIndex === -1) {
    return null;
  }

  const header = content.slice(4, closingIndex);
  const lines = header.split("\n");
  const result = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) {
      continue;
    }

    const kv = line.match(/^([a-z_][a-z0-9_]*)\s*:\s*(.*)$/i);
    if (!kv) {
      throw new Error(`Invalid frontmatter line: ${line}`);
    }

    const key = kv[1];
    const rawValue = kv[2].trim();

    if (!rawValue) {
      const list = [];
      let scan = index + 1;
      while (scan < lines.length) {
        const itemLine = lines[scan];
        const listItem = itemLine.match(/^\s+-\s+(.*)$/);
        if (!listItem) {
          break;
        }

        list.push(stripQuotes(listItem[1].trim()));
        scan += 1;
      }

      result[key] = list;
      index = scan - 1;
      continue;
    }

    result[key] = stripQuotes(rawValue);
  }

  return result;
}

function isHttpsUrl(value) {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

let hasError = false;

if (!fs.existsSync(manifestPath)) {
  fail(`Missing manifest file: ${manifestPath}`);
  process.exit(1);
}

const manifestText = fs.readFileSync(manifestPath, "utf8");
let manifest;

try {
  manifest = JSON.parse(manifestText);
} catch (error) {
  fail(`manifest.json is not valid JSON: ${String(error)}`);
  process.exit(1);
}

if (!manifest || typeof manifest !== "object" || !Array.isArray(manifest.skills)) {
  fail("manifest.json must be an object with a skills array");
  process.exit(1);
}

const seenFiles = new Set();

for (const [index, item] of manifest.skills.entries()) {
  if (!item || typeof item !== "object" || typeof item.file !== "string") {
    fail(`skills[${index}] must be an object with a file string`);
    hasError = true;
    continue;
  }

  const file = item.file.trim();
  if (!file.endsWith(".md")) {
    fail(`skills[${index}] file must end in .md: ${file}`);
    hasError = true;
  }

  if (seenFiles.has(file)) {
    fail(`Duplicate manifest file entry: ${file}`);
    hasError = true;
  }
  seenFiles.add(file);

  const fullPath = path.join(skillsDir, file);
  if (!fs.existsSync(fullPath)) {
    fail(`Listed file is missing: ${file}`);
    hasError = true;
    continue;
  }

  const content = fs.readFileSync(fullPath, "utf8");
  let frontmatter;
  try {
    frontmatter = parseFrontmatter(content);
  } catch (error) {
    fail(`${file}: ${String(error)}`);
    hasError = true;
    continue;
  }

  if (!frontmatter) {
    fail(`${file}: missing top-of-file frontmatter block`);
    hasError = true;
    continue;
  }

  const requiredStringFields = ["name", "description", "skill_url", "auth_type", "icon_url"];
  for (const field of requiredStringFields) {
    if (typeof frontmatter[field] !== "string" || !frontmatter[field].trim()) {
      fail(`${file}: frontmatter field \`${field}\` is required and must be a non-empty string`);
      hasError = true;
    }
  }

  if (!Array.isArray(frontmatter.domains) || frontmatter.domains.length === 0) {
    fail(`${file}: frontmatter field \`domains\` is required and must be a non-empty list`);
    hasError = true;
  } else {
    for (const domain of frontmatter.domains) {
      if (typeof domain !== "string" || !domain.trim()) {
        fail(`${file}: every domains[] value must be a non-empty string`);
        hasError = true;
      }
    }
  }

  if (typeof frontmatter.skill_url === "string") {
    if (!isHttpsUrl(frontmatter.skill_url)) {
      fail(`${file}: skill_url must be an https URL`);
      hasError = true;
    } else if (!frontmatter.skill_url.startsWith(SKILL_URL_PREFIX)) {
      fail(`${file}: skill_url must start with ${SKILL_URL_PREFIX}`);
      hasError = true;
    } else if (!frontmatter.skill_url.endsWith(`/skills/${file}`)) {
      fail(`${file}: skill_url should end with /skills/${file}`);
      hasError = true;
    }
  }

  if (typeof frontmatter.icon_url === "string" && !isHttpsUrl(frontmatter.icon_url)) {
    fail(`${file}: icon_url must be an https URL`);
    hasError = true;
  }

  if (typeof frontmatter.source_url === "string" && frontmatter.source_url.trim() && !isHttpsUrl(frontmatter.source_url)) {
    fail(`${file}: source_url must be an https URL when provided`);
    hasError = true;
  }
}

const markdownFiles = fs
  .readdirSync(skillsDir)
  .filter((name) => name.endsWith(".md"))
  .filter((name) => name !== "SPEC.md")
  .sort((a, b) => a.localeCompare(b));

for (const file of markdownFiles) {
  if (!seenFiles.has(file)) {
    fail(`Markdown file is not listed in manifest.json: ${file}`);
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}

console.log(`[skills:validate] OK (${manifest.skills.length} skills)`);
