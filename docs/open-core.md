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

## Commercial boundary

The core product remains usable for experimentation and basic payments. The hosted paid layer is where you charge for operational features that save customers time, reduce risk, and support scale.
