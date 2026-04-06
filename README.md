# StellarAgent

Autonomous payments for autonomous agents on Stellar.

> 📢 **Announcement**: [See our launch post on X →](https://x.com/SingularityRD/status/2040867613929058305)

## 🚀 Live Application

**Production URL:** https://agenticpayment.vercel.app

### Key Pages
- **Landing Page** - https://agenticpayment.vercel.app/
- **Pricing** - https://agenticpayment.vercel.app/pricing
- **Agent Demo** - https://agenticpayment.vercel.app/demo/agent
- **Dashboard** - https://agenticpayment.vercel.app/dashboard
- **Monitoring** - https://agenticpayment.vercel.app/dashboard/monitoring
- **API Tools** - https://agenticpayment.vercel.app/api/tools

### Documentation
- [Security Checklist](docs/security-checklist.md)
- [User Guide](docs/user-guide.md)
- [Advanced Feature: Fee Sponsorship](docs/advanced-feature.md)
- [Monitoring & Data Indexing](docs/monitoring.md)

## 📊 User Activity (30+ Wallets)

Verified Stellar wallet addresses with on-chain activity:

📄 **[View 30+ User Wallets](docs/user-wallets.md)**

All transactions verifiable on [Stellar Expert](https://stellar.expert/explorer/public/account/GAMYNXGMVAQCEZ32K7SWEENI4OTNXTBT5ZBCJA74IGSK3PVZ4I6CV42D).

### User Feedback
- 📝 **[Google Form](https://forms.google.com/TODO)** - Collecting wallet addresses and feedback
- 📊 **[Feedback Export (Excel)](https://docs.google.com/spreadsheets/TODO)** - User responses

## 🛡️ Security Features

- SHA-256 API key hashing with pepper
- Timing-safe key validation
- Rate limiting (Redis/Upstash ready)
- CORS & security headers
- Input validation with Zod
- Parameterized Prisma queries

## 🏗️ Tech Stack

- Next.js 14 + TypeScript
- PostgreSQL + Prisma
- Stellar SDK
- Vercel Edge

## ✨ Advanced Feature: Fee Sponsorship

Gasless transactions via Stellar fee-bump mechanism.

- Users pay without holding XLM
- Platform sponsors fees
- Endpoint: `POST /api/sponsored-pay`

## 📋 Submission Checklist

✅ Public repo with 15+ commits
✅ Live on Vercel
✅ Metrics & Monitoring dashboards
✅ Security checklist complete
✅ Fee Sponsorship implemented
✅ 30+ verifiable wallets
✅ Community contribution (X post)
✅ Data indexing active

## 🔧 Environment Variables

```env
DATABASE_URL=postgresql://...
STELLAR_NETWORK=mainnet
STELLAR_RPC_URL=https://soroban-rpc.mainnet.stellar.gateway.fm
PLATFORM_PUBLIC_KEY=G...
PLATFORM_SECRET_KEY=S...
SPONSOR_SECRET_KEY=S...
FEE_BPS=30
API_KEY_PEPPER=secret
INDEXER_SECRET=secret
NEXT_PUBLIC_SITE_URL=https://agenticpayment.vercel.app
```

## 📄 License

MIT
