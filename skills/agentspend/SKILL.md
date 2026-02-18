---
name: agentspend
description: Set up and manage cards and crypto wallets for paying for services.
---

## When to Use

- A service requires `billing.accepts: agentspend`.
- You need to set up a card or wallet to pay for a service.

## Commands

### Card Configure

```bash
npx agentspend card configure
```

**First time:** opens a page where the user sets their weekly spending limit, then adds their card via Stripe Checkout. Saves to `~/.agentspend/card.json`.

**Re-run:** opens the configuration page where the user can change their weekly limit, swap their card, or remove it entirely.

### Card Status

```bash
npx agentspend card status
```

Shows full card dashboard:
- **Weekly budget usage:** amount spent vs weekly limit
- **Authorized services:** list of services the card is bound to
- **Recent charges:** last 10 transactions with service name, amount, date

If no card is set up yet, shows pending setup status.

### Wallet Create

```bash
npx agentspend wallet create
```

Generates a new crypto wallet (keypair) for x402 payments. Saves to `~/.agentspend/wallet.json`. No human interaction needed. Tell the user the address so they can fund it with USDC on Base.

### Wallet Status

```bash
npx agentspend wallet status
```

Shows wallet address, network, and USDC balance.

### Pay

```bash
npx agentspend pay <url>
```

Pays a paywall-protected endpoint using card or crypto wallet.

**Options:**
- `--method card|crypto` — Force payment method (default: auto-detect)
- `--body <json>` — Request body JSON
- `--header <key:value>` — Extra headers (repeatable)

## Payment

- Cards are tried first (via `x-card-id` header).
- If a crypto wallet exists and the service returns 402 with x402 payment requirements, crypto payment is attempted as fallback.

## User Interaction

- **`card configure`:** Tell the user to configure their spending settings in the browser. On first setup, they'll set a weekly limit and add a card. Re-run to let the user change their limit, swap their card, or remove it.
- **`card status`:** Use to check remaining weekly budget, see which services are authorized, and review recent charge history. Useful before attempting a payment.
- **`wallet create`:** Tell the user the wallet address and ask them to fund it with USDC.
- Never show card IDs, private keys, or Stripe URLs in messages.
- On card success: "Your card is set up. I can now pay for services on your behalf."
- On wallet create: "I've created a wallet. Send USDC to 0x... on Base to fund it."
