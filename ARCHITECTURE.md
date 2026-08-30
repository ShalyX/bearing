# Architecture Plan

## Boundary

The marketplace owns discovery, evidence, comparison, hiring orchestration, permissions display, job records, and failure classification. Agents own domain execution. Payment protocols own settlement. The marketplace never becomes a user-fund custodian.

## Surfaces

- `/`: simple promise and four job entry points
- `/workspace/[category]`: job-specific category workspace
- `/agents/[id]`: agent record and evidence
- `/compare`: side-by-side decision surface
- `/jobs/[id]`: execution timeline, result, receipt, and failure state
- `/submit-agent`: provider submission and verification requirements
- `/about/evidence`: trust and provenance explanation

## Layers

1. Marketplace UI
2. API and validation layer
3. Domain services for listings, evidence, tests, jobs, and payments
4. Agent execution adapters
5. ERC-8004/8004scan and BNB RPC adapters
6. Real payment protocol adapter, such as x402 where suitable
7. PostgreSQL persistence
8. Observability and audit log

## Core objects

- `Agent`
- `AgentCategory`
- `Capability`
- `EvidenceRecord`
- `PerformanceRecord`
- `TestRun`
- `HireRequest`
- `Job`
- `ExecutionEvent`
- `Payment`
- `PermissionPolicy`
- `Wallet`

## Shared agent contract

- `describeCapabilities()`
- `getRequirements()`
- `quote(request)`
- `test(request)`
- `hire(request, permissionPolicy)`
- `getJobStatus(jobId)`
- `getEvidence(jobId)`
- `cancel(jobId)` where supported

Adapters remain protocol-specific. The marketplace must not encode PancakeSwap-only assumptions.

## State

Agent: `discovered → validated → listed → paused → delisted`

Job: `draft → test_requested → test_completed → hire_pending → hired → running → succeeded`

Exceptional job states: `failed`, `timed_out`, `cancelled`, `payment_pending`, `payment_held`, `payment_released`, `refund_pending`, `refunded`, `disputed`.

Payment state is never inferred from job success.

## Evidence provenance

Every evidence item is labelled as live onchain, live external API, marketplace-observed, fixture-backed test data, or agent self-reported. Fixtures are for automated tests only and never public proof.

## Security boundary

The flagship write path requires explicit approval, scoped permissions, token/spend caps, slippage limits, transaction-construction review, failure handling, audit logging, and a passed security gate before any real write transaction.
