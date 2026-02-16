# Wallet Skill

You have access to AgentSpend API endpoints for setting up and using a wallet.

## API base

- Use `https://api.agentspend.co` as the API base for all calls.
- Build every request URL as `https://api.agentspend.co/v1/...`.

## When to use this

Use this when a service skill file includes:

`billing.accepts: agentspend`

## Setup flow (no tokens)

1. Before creating a wallet, state the spending limit clearly:
- Default limit is `$200/month` (`monthly_limit_cents=20000`).
- If the owner asks for a different limit, send it in `POST /v1/wallet/create` as `monthly_limit_cents`.

2. Run setup create exactly once per attempt, parse fields, and open Checkout in the same shell command:

```bash
AGENTSPEND_API_URL="https://api.agentspend.co"
WALLET_DATA_DIR="<your agent's skill/data directory>"
setup_state_file="${WALLET_DATA_DIR}/.setup_state.json"
mkdir -p "$WALLET_DATA_DIR"

setup_response=$(curl -s -X POST "${AGENTSPEND_API_URL}/v1/wallet/create" \
  -H "Content-Type: application/json" -d '{}')
setup_id=$(printf '%s' "$setup_response" | jq -r '.setup_id // empty')
setup_url=$(printf '%s' "$setup_response" | jq -r '.setup_url // empty')

if [ -z "$setup_id" ] || [ -z "$setup_url" ]; then
  echo '{"error":"wallet_create_failed"}'
  exit 1
fi

printf '{"setup_id":"%s"}\n' "$setup_id" > "$setup_state_file"
(
  command -v open >/dev/null 2>&1 && open "$setup_url"
) || (
  command -v xdg-open >/dev/null 2>&1 && xdg-open "$setup_url"
) || (
  echo "$setup_url"
)
```

Do not print `setup_response` to the user. It contains internal IDs and long Stripe URL data.
Do not call `POST /v1/wallet/create` again unless setup reaches `expired` or `failed`.

Response includes:

- `setup_id`
- `setup_url`
- `status`
- `expires_at`

Important:
- Always quote the URL exactly as shown (`open "$setup_url"`) so the `#...` fragment is preserved.
- Never print the raw Stripe URL as a wrapped/plain wall of text.
- Never manually reconstruct or copy `setup_url` from rendered command output; only use the parsed `setup_url` variable.
- Keep `setup_id` internal by storing it in `.setup_state.json`.

If `open` is unavailable or fails, provide fallback as a single clickable markdown link only:

`[Open Stripe Checkout](<setup_url>)`

3. Tell the owner exactly:

`I'll wait while you enter your card in Stripe Checkout. Tell me when you're done.`

4. After the owner says they are done, check setup status once using the saved `setup_id`:

```bash
AGENTSPEND_API_URL="https://api.agentspend.co"
WALLET_DATA_DIR="<your agent's skill/data directory>"
setup_state_file="${WALLET_DATA_DIR}/.setup_state.json"
setup_id=$(jq -r '.setup_id // empty' "$setup_state_file" 2>/dev/null)
if [ -z "$setup_id" ]; then
  echo '{"error":"missing_setup_state"}'
  exit 1
fi

setup_status_response=$(curl -s "${AGENTSPEND_API_URL}/v1/wallet/setup/${setup_id}")
setup_status=$(printf '%s' "$setup_status_response" | jq -r '.status // ""')
wallet_id=$(printf '%s' "$setup_status_response" | jq -r '.wallet_id // empty')

if [ "$setup_status" = "ready" ] && [ -n "$wallet_id" ]; then
  printf '{"wallet_id":"%s"}\n' "$wallet_id" > "${WALLET_DATA_DIR}/wallet.json"
  rm -f "$setup_state_file"
  echo "wallet_setup_complete"
  exit 0
fi

if [ "$setup_status" = "awaiting_card" ]; then
  echo "wallet_setup_pending"
  exit 0
fi

if [ "$setup_status" = "expired" ] || [ "$setup_status" = "failed" ]; then
  echo "wallet_setup_restart_required"
  exit 0
fi

echo "wallet_setup_unknown"
```

5. Handle status:
- `wallet_setup_complete`: wallet is already stored by the script above.
- `wallet_setup_pending`: tell the owner setup is still pending and ask them to finish card entry, then wait for confirmation and run step 4 again.
- `wallet_setup_restart_required`: restart with a fresh `POST /v1/wallet/create`.
- `wallet_setup_unknown`: surface a short error and retry status check.

## No copy/paste UX contract

- Never ask the owner to copy/paste tokens, wallet IDs, or card info back to the agent.
- Ask the owner to tell you when they are done, then verify status via API.
- Owner action is only: complete card entry in Stripe Checkout.
- Do not ask the owner to copy/paste or manually retype Stripe Checkout URLs.

## Credential persistence

Store credentials in your agent's own skill/data directory. Use two files:

- `wallet.json` — persisted wallet ID: `{ "wallet_id": "wal_xxx" }`
- `.setup_state.json` — temporary setup state (delete after setup reaches `ready`)

Delete `.setup_state.json` after setup reaches `ready`.

## User-facing output rules

- Never show `setup_id`, `setup_url`, or `wallet_id` in user-facing messages.
- Never show internal plumbing language like `status=ready`, `credentials saved`, or JSON blobs.
- On success, use this exact style:
`Your wallet is set up. I can now pay for services on your behalf, up to $<limit>/month.`
- If no custom limit was chosen, use `$200/month`.

## Using services (paywall model)

1. Sign up for the service first (if required).
2. Read persisted wallet id.
3. Include `wallet_id` in each request:
- Prefer `x-wallet-id: wal_xxx` header
- Or include JSON field `wallet_id`

Example:

```http
POST /deploy
x-wallet-id: wal_xxx
Content-Type: application/json

{ "app_id": "app_123" }
```

If you receive a `402` response, the wallet limit may be exceeded or payment failed. Inform the user and stop.

## You cannot

- Change wallet limits
- Rotate service keys
- Access Stripe card details
