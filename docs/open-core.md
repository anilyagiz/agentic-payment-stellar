# Open-Core Model

StellarAgent is structured as an open-core product:

- Open-source core:
  - payment relay and fee math
  - transaction indexing
  - customer and lead capture
  - tool manifest discovery for AI agents
- Paid hosted layer:
  - sponsored payments / fee-bump handling
  - monitoring and analytics
  - team and access controls
  - audit export and compliance workflows
  - managed deployment and support

## Why this works

The open core lowers adoption friction. Teams can integrate the payment rail immediately, then upgrade once they need sponsored transactions, stronger observability, or team-grade controls.

## Agent tools

The SDK exposes a machine-readable manifest and executor so AI agents can:

- quote a payment
- submit a standard payment
- submit a sponsored payment when the plan allows it

## Example agent client

```ts
import { StellarAgentDemoClient } from "stellaragent-sdk";

const client = new StellarAgentDemoClient({
  secretKey: process.env.DEMO_AGENT_SECRET_KEY!,
  sponsorSecret: process.env.SPONSOR_SECRET_KEY,
  network: "testnet"
});

const result = await client.run({
  task: "Pay 0.5 XLM to the creator wallet after quoting the fee",
  amount: "0.5",
  destination: "G...",
  useLlm: true,
  llm: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o-mini"
  }
});
```

The same flow is exposed in the dashboard at `/demo/agent` and through the API at `/api/agent-demo`.

## Agent payment API

For direct agent integrations, use `/api/agent-pay`.

- It authenticates with the agent API key.
- It executes quote or payment flows against Stellar.
- It respects plan-based feature gates.

This is the path to use when a client app wants the agent to actually pay, rather than just showcase the planner.

## Commercial boundary

The core product remains usable for experimentation and basic payments. The hosted paid layer is where you charge for operational features that save customers time, reduce risk, and support scale.
