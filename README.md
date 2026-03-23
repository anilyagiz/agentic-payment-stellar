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
- Pricing and lead-generation funnel for paid conversion
- Open-core tool manifest for AI agents
- Plan-based monetization boundary for sponsored flows
- Metrics dashboard for operational visibility
- Monitoring dashboard and checklist docs for submission review

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
DEMO_AGENT_SECRET_KEY=S...
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

## Product Pages

- Landing page: `/`
- Pricing page: `/pricing`
- Open-core model: `/open-core`
- Agent demo: `/demo/agent`
- Agent pay API: `/api/agent-pay`
- Dashboard overview: `/dashboard`
- Transactions: `/dashboard/transactions`
- Agents: `/dashboard/agents`
- Earnings: `/dashboard/earnings`
- Monitoring: `/dashboard/monitoring`
- Tool manifest API: `/api/tools`
- Entitlements API: `/api/entitlements`
- Agent demo API: `/api/agent-demo`
- Agent event history API: `/api/agent-events`

## Submission Docs

- [Black Belt submission checklist](docs/black-belt-submission.md)
- [Advanced feature proof](docs/advanced-feature.md)
- [Open-core model](docs/open-core.md)
- [Monitoring notes](docs/monitoring.md)
- [Security checklist](docs/security-checklist.md)
- [User guide](docs/user-guide.md)
- [Demo day outline](docs/demo-day.md)

## Examples

- [Direct agent payment script](examples/agent-pay.ts)
