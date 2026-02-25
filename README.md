# ferrite

Ferrite CLI, MCP server, and OpenClaw plugin.

## Install

```bash
npm install
npm run build
```

## CLI commands

```bash
ferrite configure
ferrite search <query>
ferrite use <url> [--method GET|POST|PUT|PATCH|DELETE|...] [--header 'Content-Type:application/json'] [--body '{"hello":"world"}']
ferrite status
```

`use` accepts direct HTTPS URLs only.

## Billing behavior

- You can begin using services without adding a payment method.
- Ferrite allows up to `$5.00` in accrued no-card usage.
- When usage would exceed `$5.00`, `ferrite use` is blocked until billing is configured.
- Weekly limit checks still apply independently of billing method.

## OpenClaw plugin (primary OpenClaw path)

```bash
openclaw plugins install ferrite
openclaw plugins enable ferrite
openclaw gateway restart
```

Local install from this repo:

```bash
openclaw plugins install -l /Users/jpbonch/as/ferrite
openclaw plugins enable ferrite
openclaw gateway restart
```

Plugin tools:
- `ferrite_configure`
- `ferrite_search`
- `ferrite_use`
- `ferrite_status`

## OpenClaw routing hook

When installed as an OpenClaw plugin, Ferrite injects routing guidance each turn so the agent prefers:
1. `ferrite_search`
2. Read the selected service `skill_url`
3. `ferrite_use`
4. `ferrite_configure` if setup is needed

## MCP server (secondary)

Run local stdio MCP server:

```bash
ferrite-mcp
```

MCP tools:
- `ferrite_configure`
- `ferrite_search`
- `ferrite_use`
- `ferrite_status`

## Credentials

Local credentials are in `~/.ferrite/credentials.json`.

## Skills

- Skill files live in [`skills/`](./skills).
- Included skills are declared in [`skills/manifest.json`](./skills/manifest.json).
- Each skill file must start with YAML frontmatter per [`skills/SPEC.md`](./skills/SPEC.md), including `auth_type`.
- Validate skill metadata with:

```bash
npm run skills:validate
```

## Local backend dev CLI

Use the local entrypoint (fixed to `http://127.0.0.1:8787`) when testing against local backend:

```bash
bun run dev:local -- configure
```
