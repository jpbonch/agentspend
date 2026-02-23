# agentspend

AgentSpend CLI + MCP server for calling paid APIs.

## Install

```bash
npm install
npm run build
```

## OpenClaw Plugin (Primary for OpenClaw)

Install AgentSpend as an in-process OpenClaw plugin:

```bash
openclaw plugins install agentspend
openclaw plugins enable agentspend
openclaw gateway restart
```

For local testing from this repo:

```bash
openclaw plugins install -l /Users/jpbonch/as/agentspend
openclaw plugins enable agentspend
openclaw gateway restart
```

After restart, AgentSpend tools are available natively in OpenClaw:
- `agentspend_configure`
- `agentspend_search`
- `agentspend_pay`
- `agentspend_status`

## OpenClaw Routing Hook

When installed as an OpenClaw plugin, AgentSpend injects a routing directive each turn so the agent prefers:
1. `agentspend_search`
2. `agentspend_pay`
3. `agentspend_configure` if setup is needed

## Commands

```bash
agentspend configure
agentspend search <query>
agentspend pay <url> [--method GET|POST|PUT|PATCH|DELETE|...] [--body '{"hello":"world"}'] [--header 'Content-Type:application/json']
agentspend status
```

## MCP Server (Secondary)

Run the local stdio MCP server:

```bash
agentspend-mcp
```

OpenClaw MCP config example:

```json
{
  "mcpServers": {
    "agentspend": {
      "command": "agentspend-mcp",
      "args": []
    }
  }
}
```

MCP tools exposed:
- `agentspend_configure`
- `agentspend_search`
- `agentspend_pay`
- `agentspend_status`

On some OpenClaw versions, root `mcpServers` config is not supported; use the plugin path above in those cases.

## Credentials

Credentials are stored at `~/.agentspend/credentials.json`.

## Local backend dev CLI

Use the local entrypoint (hardcoded to `http://127.0.0.1:8787`) when testing against a local backend:

```bash
bun run dev:local -- configure
```

Build a non-published local binary:

```bash
bun run build
node dist/dev-index.js configure
```
