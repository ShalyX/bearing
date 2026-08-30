# Architecture Decisions

## ADR-001: Marketplace-first

Bearing is the product. The PancakeSwap rebalancing agent is a reference supply item, not the product boundary.

## ADR-002: Agent-first and category-first

Users begin by choosing a job category, then browse and compare agents. Task posting, bidding, and automatic matching are deferred.

## ADR-003: Non-custodial

Bearing never holds user funds. Payment and execution use real protocol paths with explicit wallet approval.

## ADR-004: Real execution

Public product proof uses live data and real execution. Fixtures are restricted to automated tests and never presented as live evidence.

## ADR-005: Testnet security gate

Real writes begin on testnet after security review. Mainnet real-fund activity is outside the MVP.
