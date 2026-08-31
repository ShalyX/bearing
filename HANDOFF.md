# Handoff

## Current state

The Build the Era requirements were verified against the official BNB Chain challenge page and the marketplace implementation is present in this repository.

The marketplace baseline was recovered at commit `7a3e936`; an abandoned single-agent rewrite is preserved separately in `stash@{0}`. The PancakeSwap rebalancing read path now targets BSC testnet and has been verified against a live V3 position, its owner, and its pool. Health Monitor is integrated through its public, read-only endpoint, verified against an actual JSON response and durable evidence trace, and identified as ERC-8004 #2040. Grid and Yield identities were registered from dedicated BSC testnet wallets as ERC-8004 #2047 and #2048.

The local and production `DATABASE_URL` are configured and the schema migration has been applied. The public `/api/ready` endpoint, local smoke test, and production build pass. A real, read-only PancakeSwap position test persisted evidence job `3f2e93a6-608f-4d4d-9540-86eb862c9527`; no wallet action or onchain write was performed.

Grid Trading and Yield Optimisation are now live, read-only BSC testnet endpoints. The latest public calls persisted evidence jobs `9f36c659-fa46-4c8c-8b94-23651f397928` (Grid) and `06e7e77e-d65a-474f-b129-114c1c0cb6b3` (Yield). Grid is ERC-8004 #2047 and Yield is ERC-8004 #2048; both registrations resolve to live A2A agent-card routes, and the public host serves `/.well-known/agent-registration.json` for domain proof.

The baseline mobile and security review is complete. The public smoke suite and security headers pass, payment receipts are sender-bound and rate-limited, and the mobile marketplace keeps navigation, safe areas, focus states, and responsive cards intact. Remaining mainnet gates are documented in `SECURITY_REVIEW.md`.

## Product decisions locked

- The submitted product is the marketplace, not an agent portfolio.
- The marketplace is agent-first and category-first.
- The four BNB categories remain first-class.
- The UX must be usable by someone without BNB Agent Studio or blockchain expertise.
- The marketplace is non-custodial.
- The flagship supply item is a real PancakeSwap concentrated-liquidity rebalancer.
- Product name: Bearing. Recommended domain: `bearingagents.com`, pending registrar confirmation.
- Health Factor Monitoring has a verified live integration and ERC-8004 #2040. Rebalancing, Grid Trading, and Yield Optimisation have verified live BSC testnet read paths; Grid and Yield are ERC-8004 #2047 and #2048.
- No public mock execution or invented performance evidence.
- No write transaction before a security review passes.

## Immediate next steps

1. Submit the public URL, registration transaction links, and latest evidence job IDs in the hackathon packet.
2. Keep all PancakeSwap services read-only until the write-path security gate passes.
3. Complete the optional hostile-judge review before any write-path work.
4. Record identity, endpoint, invocation, result, and transaction evidence for every future agent listing.

## Do not do

- Do not scan or reuse old repositories before the product contract is frozen.
- Do not build a generic dashboard or agent directory.
- Do not list agents that cannot be personally verified.
- Do not use fixtures as public execution evidence.
- Do not execute a wallet transaction before the security gate.
- Do not deploy or spend funds without explicit approval.
- Do not mark a category as live merely because its UI or service contract exists.

## Verification required at every handoff

Record exact test output, database readback, live endpoint status, transaction hashes where applicable, and the current documented next task.
