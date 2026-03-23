# StellarAgent

Autonomous payments for autonomous agents on Stellar.

## What is production-ready here

- RPC-based transaction submission and confirmation
- Fee calculation in stroops, not floats
- API key hashing instead of plaintext storage
- Server-side validation for agent registration and transaction relays
- Testnet/mainnet network selection through environment variables
- Fee sponsorship support via fee-bump transactions
- Transaction indexing through the application database

## Stack

- Next.js 14
- TypeScript
- PostgreSQL + Prisma
- `@stellar/stellar-sdk`

## Important Stellar constraints

- Classic Stellar payment operations only work with Stellar assets and Stellar accounts, not contract addresses.
- Memo text is limited to 28 bytes.
- Stellar transaction fees are paid in XLM.
- The fee split payment model in this repo is designed for native XLM payments.

## Environment

```env
DATABASE_URL=postgresql://...
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
PLATFORM_PUBLIC_KEY=G...
PLATFORM_SECRET_KEY=S...
SPONSOR_SECRET_KEY=S...
FEE_BPS=30
API_KEY_PEPPER=change-me
INDEXER_SECRET=change-me
NEXT_PUBLIC_SITE_URL=https://stellaragent.vercel.app
```

## Run

```bash
npm install
npm run build
npm run dev
```

