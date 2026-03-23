# Monitoring

## What is monitored

- Total transactions
- Confirmed vs failed transaction status
- Platform earnings
- Active agents
- Indexing latency and backlog

## Dashboard

- Metrics dashboard: [`/dashboard`](../apps/dashboard/app/dashboard/page.tsx)
- Transactions: [`/dashboard/transactions`](../apps/dashboard/app/dashboard/transactions/page.tsx)
- Monitoring dashboard: [`/dashboard/monitoring`](../apps/dashboard/app/dashboard/monitoring/page.tsx)

## Current indexing flow

- `POST /api/sync` reconciles pending transactions against Stellar RPC.
- `GET /api/indexed-transactions` exposes the indexed transaction list.
- `GET /api/metrics` powers the overview cards.

## Alerting guidance

- Page if `failed / total` exceeds 5% over a short window.
- Page if indexing lags behind by more than a few minutes.
- Page if `DATABASE_URL` or RPC endpoints fail health checks.
