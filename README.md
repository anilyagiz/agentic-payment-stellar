# StellarAgent

Autonomous payments for autonomous agents on Stellar.

> 📢 **Announcement**: [See our launch post on X →](https://x.com/SingularityRD/status/2040867613929058305)

## 🚀 Live Links

| Resource | Link |
|---|---|
| **Live Demo** | https://agenticpayment.vercel.app |
| **Landing Page** | https://agenticpayment.vercel.app |
| **Metrics Dashboard** | https://agenticpayment.vercel.app/dashboard |
| **Monitoring Dashboard** | https://agenticpayment.vercel.app/dashboard/monitoring |
| **Pricing** | https://agenticpayment.vercel.app/pricing |
| **Open Core** | https://agenticpayment.vercel.app/open-core |
| **Agent Demo** | https://agenticpayment.vercel.app/demo/agent |
| **API Reference** | https://agenticpayment.vercel.app/api/tools |
| **Health Check** | https://agenticpayment.vercel.app/api/health |
| **Security Checklist** | [docs/security-checklist.md](docs/security-checklist.md) |
| **User Guide** | [docs/user-guide.md](docs/user-guide.md) |
| **Advanced Feature Proof** | [docs/advanced-feature.md](docs/advanced-feature.md) |
| **Data Indexing** | [docs/monitoring.md](docs/monitoring.md) |

## 📊 User Feedback & Onboarding

### Google Form
We collect user details including wallet address, email, name, and product feedback through our onboarding form:

📝 **[User Feedback Form](TODO: Google Form link)**

### User Wallet Addresses (30+)
Verified Stellar wallet addresses collected through user onboarding:

| # | Wallet Address | Status |
|---|---|---|
| 1 | `TODO` | Verified |
| 2 | `TODO` | Verified |
| 3 | `TODO` | Verified |
| ... | *(30+ addresses will be listed here)* | |

> All addresses are verifiable on [Stellar Expert](https://stellar.expert/explorer/public).

### User Feedback Export
📊 **[Download User Responses (Excel)](TODO: Google Sheets export link)**

### Improvement Plan Based on User Feedback

Based on collected user feedback, here's our roadmap for the next phase:

| Feedback | Improvement Plan | Commit |
|---|---|---|
| *(Pending user responses)* | *(Will be updated after collecting feedback)* | *(Will be added)* |

> This section will be continuously updated as we collect more user feedback. Each improvement will be tracked with a git commit link.

## 🛡️ Security

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

Full checklist: [docs/security-checklist.md](docs/security-checklist.md)

## 🏗️ Stack

- Next.js 14
- TypeScript
- PostgreSQL + Prisma
- `@stellar/stellar-sdk`

## ✨ Advanced Feature: Fee Sponsorship

StellarAgent implements **gasless transactions** using Stellar's fee-bump mechanism:

- Users submit transactions without holding XLM for fees
- Platform sponsors the fee on behalf of the user
- Implemented in [`packages/sdk/src/feeBump.ts`](packages/sdk/src/feeBump.ts)
- API endpoint: `POST /api/sponsored-pay`

Full proof: [docs/advanced-feature.md](docs/advanced-feature.md)

## 📈 Data Indexing

All transactions are indexed in PostgreSQL via Prisma:

- Transaction records: hash, accounts, amounts, fees, memos, status
- Agent event history: kind, source, tool name, status, payload
- Platform earnings tracking
- Index cursor for horizon streaming sync

Full approach: [docs/monitoring.md](docs/monitoring.md)

## 📋 Black Belt Submission Checklist

- [x] Public GitHub repository
- [x] README with complete documentation
- [x] Technical documentation and user guide
- [x] 15+ meaningful commits
- [x] Live demo deployed on Vercel
- [x] Metrics dashboard live
- [x] Monitoring dashboard active
- [x] Security checklist completed
- [x] Advanced feature implemented (Fee Sponsorship)
- [x] Data indexing implemented
- [x] Community contribution (X/Twitter post)
- [ ] 30+ verified active users (collecting)
- [ ] Google Form responses exported to Excel
- [ ] Demo Day presentation prepared

## 🔧 Environment

```env
DATABASE_URL=postgresql://...
STELLAR_NETWORK=mainnet
STELLAR_RPC_URL=https://soroban-rpc.mainnet.stellar.gateway.fm
PLATFORM_PUBLIC_KEY=G...
PLATFORM_SECRET_KEY=S...
SPONSOR_SECRET_KEY=S...
DEMO_AGENT_SECRET_KEY=S...
FEE_BPS=30
API_KEY_PEPPER=change-me
INDEXER_SECRET=change-me
NEXT_PUBLIC_SITE_URL=https://stellaragent.vercel.app
```

## 🏃 Run Locally

```bash
npm install
npm run build
npm run dev
```

## 📄 License

MIT
