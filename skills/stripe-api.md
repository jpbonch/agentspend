---
name: "Stripe API"
description: "Connected Stripe account APIs for customers, payments, subscriptions, invoices, and refunds."
domains:
  - "api.stripe.com"
source_url: "https://api.stripe.com/v1/customers"
skill_url: "https://raw.githubusercontent.com/jpbonch/ferrite/main/skills/stripe-api.md"
auth_type: "oauth"
icon_url: "https://stripe.com/favicon.ico"
---
## Stripe API (OAuth)

`api.stripe.com` (via Ferrite OAuth)

Description: Use your connected Stripe account to manage customers, payment intents, subscriptions, invoices, and refunds.
Price: Provider/API dependent. Ferrite call cost depends on endpoint x402 policy.

OAuth behavior:
- Connect Stripe in `ferrite configure` first.
- Do not send an `Authorization` header; Ferrite handles OAuth tokens.
- This setup targets Stripe Connect Standard accounts.

Headers you should set:
- `accept:application/json`
- `content-type:application/x-www-form-urlencoded` for most `POST`/`DELETE` v1 endpoints.

Body guidance:
- Stripe v1 write endpoints generally expect URL-encoded form fields.
- Nested params use bracket notation (for example `metadata[order_id]=123`).
- Amount values are in the currency's minor unit (`amount=1099` for USD $10.99).

Common endpoints:
- `GET /v1/account` - Retrieve the connected account.
- `GET /v1/customers` - List customers.
- `POST /v1/customers` - Create a customer.
- `POST /v1/payment_intents` - Create a payment intent.
- `GET /v1/subscriptions` - List subscriptions.
- `POST /v1/subscriptions` - Create a subscription.
- `GET /v1/invoices` - List invoices.
- `POST /v1/refunds` - Create a refund.

Example call (connected account):

```bash
npx @jpbonch/ferrite use https://api.stripe.com/v1/account \
  --method GET \
  --header "accept:application/json"
```

Example call (list customers):

```bash
npx @jpbonch/ferrite use "https://api.stripe.com/v1/customers?limit=10" \
  --method GET \
  --header "accept:application/json"
```

Example call (create customer):

```bash
npx @jpbonch/ferrite use https://api.stripe.com/v1/customers \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/x-www-form-urlencoded" \
  --body "email=customer@example.com&name=Ferrite%20Customer&metadata[source]=ferrite"
```

Example call (create payment intent):

```bash
npx @jpbonch/ferrite use https://api.stripe.com/v1/payment_intents \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/x-www-form-urlencoded" \
  --body "amount=1099&currency=usd&confirm=false&automatic_payment_methods[enabled]=true"
```

Example call (list subscriptions):

```bash
npx @jpbonch/ferrite use "https://api.stripe.com/v1/subscriptions?limit=10" \
  --method GET \
  --header "accept:application/json"
```

Example call (create subscription):

```bash
npx @jpbonch/ferrite use https://api.stripe.com/v1/subscriptions \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/x-www-form-urlencoded" \
  --body "customer=cus_123&items[0][price]=price_123&collection_method=charge_automatically"
```

Example call (list invoices):

```bash
npx @jpbonch/ferrite use "https://api.stripe.com/v1/invoices?limit=10" \
  --method GET \
  --header "accept:application/json"
```

Example call (create refund):

```bash
npx @jpbonch/ferrite use https://api.stripe.com/v1/refunds \
  --method POST \
  --header "accept:application/json" \
  --header "content-type:application/x-www-form-urlencoded" \
  --body "payment_intent=pi_123&amount=500&reason=requested_by_customer"
```

Official docs:
- https://docs.stripe.com/connect/oauth-reference
- https://docs.stripe.com/connect/authentication
- https://docs.stripe.com/api/customers
- https://docs.stripe.com/api/payment_intents
- https://docs.stripe.com/api/subscriptions
- https://docs.stripe.com/api/invoices
- https://docs.stripe.com/api/refunds
