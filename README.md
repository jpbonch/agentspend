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

## Local backend dev CLI

Use the local entrypoint (fixed to `http://127.0.0.1:8787`) when testing against local backend:

```bash
bun run dev:local -- configure
```
