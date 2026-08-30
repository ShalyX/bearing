# Security Plan

## Boundary

Bearing never custodies user funds. Agents execute only through explicit, user-approved permissions and protocol-defined payment paths.

## Pre-transaction gate

No real write transaction is allowed until:

- Permissions are scoped and human-readable
- Transaction construction is reviewed
- Token/spend caps are enforced
- Slippage limits are enforced
- Wallet and signer boundaries are verified
- Failure, timeout, and cancellation behavior is tested
- Audit logging and database persistence are verified
- Independent hostile review passes

## Agent risks

- Agent overreach
- Incorrect transaction construction
- Stale protocol data
- Prompt or input manipulation
- Replay or duplicate execution
- Unbounded retries
- Agent endpoint compromise
- Misleading performance claims

## Payment

Payment status is separate from job status. Bearing does not promise refunds unless the actual payment protocol supports them. Payment and transaction evidence must be recorded independently.

## Secrets

Secrets stay in local protected files or provider dashboards. No API keys, private keys, seed phrases, or database URLs belong in the repository or chat.

## Claim policy

Live, testnet, fixture, self-reported, and marketplace-observed evidence must never be conflated in UI, README, demo video, or submission text.
