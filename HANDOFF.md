# Handoff

## Current state

The Build the Era requirements were verified against the official BNB Chain challenge page and the marketplace implementation is present in this repository.

The marketplace baseline was recovered at commit `7a3e936`; an abandoned single-agent rewrite is preserved separately in `stash@{0}`. The PancakeSwap rebalancing read path now targets BSC testnet and has been verified against a live V3 position, its owner, and its pool. Health Monitor is integrated through its public, read-only endpoint, verified against an actual JSON response and durable evidence trace, and identified as ERC-8004 #2040. No wallet write transaction has been performed.

The local and production `DATABASE_URL` are configured and the schema migration has been applied. The public `/api/ready` endpoint, local smoke test, and production build pass. A real, read-only PancakeSwap position test persisted evidence job `3f2e93a6-608f-4d4d-9540-86eb862c9527`; no wallet action or onchain write was performed.

Grid Trading and Yield Optimisation are now live, read-only BSC testnet endpoints. Grid Trading read the CAKE/XRP PancakeSwap V3 pool and persisted evidence job `493ee5a9-7525-4778-9fb2-4092dce15182`; Yield Optimisation read testnet LP #11899, its pool conditions, and persisted evidence job `fd7498e8-47a7-4fc9-b9a9-c26138133b9e`. Their ERC-8004 identities are intentionally still marked pending until they are registered on BSC.

## Product decisions locked

- The submitted product is the marketplace, not an agent portfolio.
- The marketplace is agent-first and category-first.
- The four BNB categories remain first-class.
- The UX must be usable by someone without BNB Agent Studio or blockchain expertise.
- The marketplace is non-custodial.
- The flagship supply item is a real PancakeSwap concentrated-liquidity rebalancer.
- Product name: Bearing. Recommended domain: `bearingagents.com`, pending registrar confirmation.
- Health Factor Monitoring has a verified live integration and ERC-8004 #2040. Rebalancing, Grid Trading, and Yield Optimisation have verified live BSC testnet read paths; Grid and Yield still require BSC ERC-8004 registration.
- No public mock execution or invented performance evidence.
- No write transaction before a security review passes.

## Immediate next steps

1. Register BSC ERC-8004 identities for Grid Trading and Yield Optimisation, then attach the resulting IDs and transaction evidence to their listings.
2. Keep all PancakeSwap services read-only until the write-path security gate passes.
3. Commit and push the recovered marketplace and new agent work, then redeploy from the repository.
4. Record identity, endpoint, invocation, result, and transaction evidence for every agent listing.

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
