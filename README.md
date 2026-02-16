# AgentSpend

Pay for services from AI agents. Cards (Stripe) and crypto (x402/USDC on Base).

## Packages

| Package | Description |
|---------|-------------|
| [`agentspend`](https://www.npmjs.com/package/agentspend) | CLI for managing cards and wallets |
| [`@agentspend/sdk`](https://www.npmjs.com/package/@agentspend/sdk) | SDK for services to accept agent payments |

## CLI

```bash
npm install -g agentspend
```

### Card setup (Stripe)

```bash
# Start card setup — opens Stripe in your browser
agentspend card setup

# Check setup status
agentspend card status
```

`card setup` creates a card via the AgentSpend API, opens the Stripe setup URL in your browser, and polls until the card is ready. The `card_id` is saved to `~/.agentspend/card.json`.

### Wallet (crypto)

```bash
# Generate a new wallet for x402 payments
agentspend wallet create

# Show address, network, and USDC balance
agentspend wallet status
```

`wallet create` generates a local private key and saves it to `~/.agentspend/wallet.json`. Fund the address with USDC on Base to pay x402-enabled services.

## SDK

```bash
npm install @agentspend/sdk
```

### Paywall middleware (Hono)

Add a paywall to any endpoint. Accepts both card and crypto payments automatically.

```ts
import { createAgentSpend, getPaymentContext } from "@agentspend/sdk";

const spend = createAgentSpend({
  serviceApiKey: process.env.AGENTSPEND_SERVICE_API_KEY,
  crypto: {
    receiverAddress: "0x...", // your USDC address on Base
  },
});

app.post("/api/generate", spend.paywall({ amount: 100 }), async (c) => {
  const payment = getPaymentContext(c);
  // payment.method === "card" | "crypto"
  // payment.amount_cents === 100
  return c.json({ result: "..." });
});
```

### Dynamic pricing

```ts
// Read amount from request body field
spend.paywall({ amount: "amount_cents" });

// Custom pricing function
spend.paywall({ amount: (body) => calculatePrice(body) });
```

### Direct charge (card only)

```ts
const result = await spend.charge("card_abc123", {
  amount_cents: 500,
  description: "API call",
});
```

## How agents pay

**Card:** Agent sends `x-card-id: card_xxx` header (or `card_id` in the request body).

**Crypto:** Agent sends `x-payment` header with a signed x402 payment payload.

If neither is provided, the service returns `402 Payment Required` with x402 payment requirements.

## Environment variables

| Variable | Description |
|----------|-------------|
| `AGENTSPEND_API_URL` | Platform API base URL (default: `https://api.agentspend.co`) |
| `AGENTSPEND_SERVICE_API_KEY` | Service API key (from service onboarding) |
