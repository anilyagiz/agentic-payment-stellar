# User Guide

## 1. Create a wallet

Use the onboarding panel on the landing page to create a testnet wallet.

## 2. Register an agent

Submit the wallet public key in the onboarding form to receive an API key.

## 3. Submit payments

Call `POST /api/pay` with a signed transaction XDR and the API key in `x-api-key`.

## 4. Sponsor fees

Use `POST /api/sponsored-pay` when you need the platform to cover transaction fees.

## 5. Review activity

- Overview metrics: `/dashboard`
- Transactions: `/dashboard/transactions`
- Agents: `/dashboard/agents`
- Earnings: `/dashboard/earnings`
- Pricing: `/pricing`

## 6. Operate in production

- Keep `DATABASE_URL`, `STELLAR_RPC_URL`, `API_KEY_PEPPER`, `INDEXER_SECRET`, and `SPONSOR_SECRET_KEY` set.
- Run the sync job on a schedule so pending transactions are reconciled.
- Monitor failed submissions and indexing lag through the dashboard.
