# agentspend

AgentSpend CLI, MCP server, and OpenClaw plugin.

## Install

```bash
npm install
npm run build
```

## CLI commands

```bash
agentspend configure
agentspend search <query>
agentspend use <url> [--method GET|POST|PUT|PATCH|DELETE|...] [--header 'Content-Type:application/json'] [--body '{"hello":"world"}']
agentspend status
```

`use` accepts direct HTTPS URLs only.

## Billing behavior

- You can begin using services without adding a payment method.
- AgentSpend allows up to `$5.00` in accrued no-card usage.
- When usage would exceed `$5.00`, `agentspend use` is blocked until billing is configured.
- Weekly limit checks still apply independently of billing method.

## OpenClaw plugin (primary OpenClaw path)

```bash
openclaw plugins install agentspend
openclaw plugins enable agentspend
openclaw gateway restart
```

Local install from this repo:

```bash
openclaw plugins install -l /Users/jpbonch/as/agentspend
openclaw plugins enable agentspend
openclaw gateway restart
```

Plugin tools:
- `agentspend_configure`
- `agentspend_search`
- `agentspend_use`
- `agentspend_status`

## OpenClaw routing hook

When installed as an OpenClaw plugin, AgentSpend injects routing guidance each turn so the agent prefers:
1. `agentspend_search`
2. Read the selected service `skill_url`
3. `agentspend_use`
4. `agentspend_configure` if setup is needed

## MCP server (secondary)

Run local stdio MCP server:

```bash
agentspend-mcp
```

MCP tools:
- `agentspend_configure`
- `agentspend_search`
- `agentspend_use`
- `agentspend_status`

## Credentials

Local credentials are in `~/.agentspend/credentials.json`.

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
