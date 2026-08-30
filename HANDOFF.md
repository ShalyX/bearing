# Handoff

## Current state

The Build the Era requirements were verified against the official BNB Chain challenge page. The marketplace-first product concept, trust model, agent supply strategy, design direction, and execution gates are documented.

No repository, application code, wallet transaction, deployment, or paid integration has been started.

## Product decisions locked

- The submitted product is the marketplace, not an agent portfolio.
- The marketplace is agent-first and category-first.
- The four BNB categories remain first-class.
- The UX must be usable by someone without BNB Agent Studio or blockchain expertise.
- The marketplace is non-custodial.
- The flagship supply item is a real PancakeSwap concentrated-liquidity rebalancer.
- Product name: Bearing. Recommended domain: `bearingagents.com`, pending registrar confirmation.
- The other three categories use verified live integrations.
- No public mock execution or invented performance evidence.
- No write transaction before a security review passes.

## Immediate next steps

1. Choose and verify the product name, domain, and handle strategy.
2. Inspect the build environment and choose the final stack.
3. Create the approved documentation skeleton in the project root.
4. Define the agent integration contract.
5. Verify available live agent sources for the three supporting categories.
6. Build the marketplace domain model before the flagship agent implementation.

## Do not do

- Do not scan or reuse old repositories before the product contract is frozen.
- Do not build a generic dashboard or agent directory.
- Do not list agents that cannot be personally verified.
- Do not use fixtures as public execution evidence.
- Do not execute a wallet transaction before the security gate.
- Do not deploy or spend funds without explicit approval.

## Verification required at every handoff

Record exact test output, database readback, live endpoint status, transaction hashes where applicable, and the current documented next task.
