# @agentspend/sdk

SDK for services to accept AI agent payments — cards (Stripe) and crypto (x402/USDC on Base).

## Install

```bash
npm install @agentspend/sdk
```

## Paywall middleware (Hono)

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

## Direct charge (card only)

```ts
const result = await spend.charge("card_abc123", {
  amount_cents: 500,
  description: "API call",
});
```

## How agents pay

**Card:** Agent sends `x-card-id: card_xxx` header or `card_id` in the request body.

**Crypto:** Agent sends `x-payment` header with a signed x402 payment payload.

If neither is provided, the service returns `402 Payment Required` with x402 payment requirements.

## Configuration

```ts
const spend = createAgentSpend({
  // Stripe card payments (get key from service onboarding)
  serviceApiKey: "sk_...",

  // Crypto payments (optional)
  crypto: {
    receiverAddress: "0x...",       // static payTo address
    network: "eip155:8453",         // default: Base
    facilitatorUrl: "https://...",  // default: x402.org
  },

  // Override platform API URL (optional)
  platformApiBaseUrl: "https://api.agentspend.co",
});
```

At least one of `serviceApiKey` or `crypto` must be provided.

## Environment variables

| Variable | Description |
|----------|-------------|
| `AGENTSPEND_API_URL` | Platform API base URL (default: `https://api.agentspend.co`) |
| `AGENTSPEND_SERVICE_API_KEY` | Service API key (from service onboarding) |
