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

## Security

- API key authentication required for all data endpoints
- SHA-256 API key hashing with pepper
- Timing-safe comparison for key validation
- Distributed rate limiting (Redis/Upstash for production)
- CORS configuration with security headers
- Request size limiting (1MB)
- Input validation with Zod schemas
- Parameterized Prisma queries (SQL injection safe)
- Stellar address validation
- Transaction source verification

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
# Optional: Redis for distributed rate limiting (production)
UPSTASH_REDIS_REST_URL=https://...redislabs.com
UPSTASH_REDIS_REST_TOKEN=your-token
```

## Vercel Deployment

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/anilyagiz/agentic-payment-stellar)

### Manual Setup

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Set Environment Variables:**
   Copy `.env.example` to Vercel dashboard:
   ```bash
   vercel env add DATABASE_URL
   vercel env add API_KEY_PEPPER
   vercel env add INDEXER_SECRET
   vercel env add SPONSOR_SECRET_KEY
   vercel env add PLATFORM_SECRET_KEY
   vercel env add DEMO_AGENT_SECRET_KEY
   vercel env add NEXT_PUBLIC_SITE_URL
   ```

4. **Deploy:**
   ```bash
   vercel --prod
   ```

### Database Setup (Required)

For serverless deployment, use a connection-pooled database URL:

```env
DATABASE_URL=postgresql://user:pass@host:port/db?pgbouncer=true&connection_limit=10
```

**Recommended:**
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)

### Redis Setup (Optional but Recommended)

For distributed rate limiting across serverless functions:

1. Create free account at [Upstash](https://upstash.com)
2. Copy REST URL and token to environment variables
3. Rate limiting will automatically use Redis when configured

### Pre-Deployment Checklist

- [ ] All environment variables set in Vercel dashboard
- [ ] Database migrated with `npx prisma migrate deploy`
- [ ] Testnet wallet funded for demo
- [ ] Custom domain configured (optional)
- [ ] Build passes locally: `npm run build`

## Run Locally

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
