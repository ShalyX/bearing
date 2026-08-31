# BNB Agent Marketplace

An evidence-first marketplace for BNB Smart Chain agents.

## Product promise

Find the right onchain agent. Understand it quickly. Hire it safely.

## What we are building

A marketplace for live BNB Smart Chain agents. Users begin with a job category, understand the task, browse verified agents, compare evidence, approve a bounded hire, and inspect the execution result.

The marketplace is the product. The PancakeSwap rebalancing agent is only the first real supply item used to validate the marketplace.

## Required categories

- Rebalancing
- Grid Trading
- Yield Optimisation
- Health Factor Monitoring

Every listed agent must be live and executable. No mock agent may be presented as live.

## Core journey

`Choose job category → Search/filter agents → Inspect evidence → Compare → Run bounded test → Connect wallet when required → Hire → Track execution → Verify result and payment`

## Documentation map

- `PRODUCTION_PLAN.md`: full scope, architecture, phases, gates, tests, and submission requirements.
- `HANDOFF.md`: current state and the next safe continuation point.
- `ARCHITECTURE.md`: marketplace boundaries, adapters, domain objects, and data flow.
- `DESIGN.md`: UX, visual system, surfaces, states, and usability checks.
- `SECURITY_REVIEW.md`: baseline security and responsive mobile review, including remaining mainnet gates.

## Current status

- The marketplace implementation is restored and builds successfully.
- The PancakeSwap rebalancing path is verified against BSC testnet: it reads a live V3 position, checks ownership, resolves the pool, and records the source block.
- Rebalancing and Health Factor Monitoring are live, verified read-only listings. Grid Trading now maps bounded CAKE/XRP testnet grid levels from a live PancakeSwap V3 pool, and Yield Optimisation reads a live LP position’s range and accrued-fee conditions. Both persist a Bearing evidence job for every invocation and neither submits a transaction.
- Health Monitor has a verified ERC-8004 identity (#2040). Grid Trading and Yield Optimisation are verified as ERC-8004 #2047 and #2048, with live A2A cards, endpoint/invocation evidence, and no write permissions.
- PostgreSQL is configured locally and in the public deployment. The schema migration, readiness endpoint, smoke suite, and real read-only PancakeSwap evidence jobs have passed.
