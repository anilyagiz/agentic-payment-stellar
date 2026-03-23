# Advanced Feature: Fee Sponsorship

## What it does

The dashboard exposes sponsored, fee-bump based payment support so an account can submit a transaction while another account pays the fee.

## Implementation

- `packages/sdk/src/feeBump.ts` builds and submits fee-bump transactions.
- `apps/dashboard/app/api/sponsored-pay/route.ts` exposes the sponsored payment endpoint.
- `apps/dashboard/app/api/pay/route.ts` records and indexes the resulting transaction.

## Why it matters

- Enables gasless onboarding for users who do not hold XLM yet.
- Reduces friction for production rollout and user acquisition.
- Gives the product a concrete advanced feature for demo-day review.
