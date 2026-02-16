# AgentSpend

CLI for managing AI agent payment methods — cards (Stripe) and crypto wallets (USDC on Base).

## Install

```bash
npm install -g agentspend
```

## Card setup (Stripe)

```bash
# Start card setup — opens Stripe in your browser
agentspend card setup

# Check setup status
agentspend card status
```

`card setup` creates a card via the AgentSpend API, opens the Stripe setup URL in your browser, and polls until the card is ready. The `card_id` is saved to `~/.agentspend/card.json`.

Agents use the `card_id` to pay services by sending `x-card-id: card_xxx` in request headers.

## Wallet (crypto)

```bash
# Generate a new wallet for x402 payments
agentspend wallet create

# Show address, network, and USDC balance
agentspend wallet status
```

`wallet create` generates a local private key and saves it to `~/.agentspend/wallet.json`. Fund the address with USDC on Base to pay x402-enabled services.

## Configuration

| Variable | Description |
|----------|-------------|
| `AGENTSPEND_API_URL` | Platform API base URL (default: `https://api.agentspend.co`) |

Config files are stored in `~/.agentspend/`.
