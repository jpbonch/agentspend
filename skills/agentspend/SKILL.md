---
name: agentspend
description: Set up and manage cards and crypto wallets for paying for services.
---

when_to_use:
  - A service requires `billing.accepts: agentspend`.
  - You need to set up a card or wallet to pay for a service.

commands:
  card setup: |
    npx agentspend card setup
    # Links user's credit card via Stripe Checkout. Opens browser, polls
    # until complete. Saves to ~/.agentspend/card.json.
  card status: |
    npx agentspend card status
    # Checks setup status of a pending card.
  wallet create: |
    npx agentspend wallet create
    # Generates a new crypto wallet (keypair) for x402 payments.
    # Saves to ~/.agentspend/wallet.json. No human interaction needed.
    # Tell the user the address so they can fund it with USDC on Base.
  wallet status: |
    npx agentspend wallet status
    # Shows wallet address, network, and USDC balance.

payment:
  - Cards are tried first (via x-card-id header).
  - If a crypto wallet exists and the service returns 402 with x402 payment requirements,
    crypto payment is attempted as fallback.

user_interaction:
  - `card setup`: Tell the user to complete card entry in the browser.
  - `wallet create`: Tell the user the wallet address and ask them to fund it with USDC.
  - Never show card IDs, private keys, or Stripe URLs in messages.
  - On card success: "Your card is set up. I can now pay for services on your behalf."
  - On wallet create: "I've created a wallet. Send USDC to 0x... on Base to fund it."
