# BNB Agent Marketplace Production Plan

> **Status:** Planning only. No application code, project setup, deployment, wallet transaction, or paid integration begins until this plan is reviewed and approved.
>
> **For Hermes:** Execute this plan in verified slices. Keep `README.md`, `HANDOFF.md`, and the supporting documentation current after each completed slice.

**Goal:** Build a publicly accessible BNB Smart Chain AI-agent marketplace that helps a user discover, compare, test, and hire live agents across all four required categories, with evidence strong enough to support a trustworthy hiring decision.

**Architecture:** A proof-forward marketplace application with a deterministic catalog and evidence layer, live ERC-8004/8004scan enrichment where available, a controlled agent execution adapter, and a transparent job/payment state machine. The first release prioritizes a complete user journey over broad infrastructure.

**Marketplace-first rule:** The marketplace is the product and must remain agent-agnostic. The flagship rebalancing agent is only the first real supply item and reference implementation used to validate discovery, evidence, hiring, permissions, execution records, and failure handling. Marketplace contracts and interfaces must not encode PancakeSwap-specific assumptions that prevent other agents or categories from integrating later.

**Tech Stack:** Proposed Next.js 15+ and TypeScript frontend/application layer, PostgreSQL-compatible persistence, server-side API routes, BNB Smart Chain testnet integration, ERC-8004/8004scan data adapter, and a wallet/payment adapter that can be isolated behind interfaces. Final stack is locked at the architecture gate after repository and environment inspection.

---

## 1. Verified event constraints

Source: official BNB Chain hackathon page and official BNB Chain blog announcement.

- Event: The Smart Money Era: Build the Era.
- Main challenge: build the BNB Agent Studio marketplace, not a portfolio of agents.
- Build period: August 5–September 9, 2026, UTC+0.
- Eligibility: individuals or teams globally; one entry per team.
- Submission: functional and publicly accessible during judging.
- Marketplace agents: surfaced agents must be live on BNB Smart Chain.
- Main-track prize: $30,000 equivalent plus possible official adoption as the BNB Agent Studio marketplace.
- Main judging signals published: functionality, data quality, and agent diversity.
- Four first-class categories required by the challenge page:
  1. Rebalancing
  2. Grid Trading
  3. Yield Optimisation
  4. Health Factor Monitoring
- Single-category submissions score poorly. All four categories need equal depth.
- BNB Agent Studio is the agent runtime/scaffolding context, not a separate product track.
- ERC-8004 provides the onchain identity and reputation/track-record foundation.
- 8004scan provides identity, capability, ownership, reputation, feedback, and network data, with a stated temporary Pro API tier for eligible participants.
- Binance x402 is described as the payment facilitator in BNB Agent Studio.

Partner-track constraints are optional and must not compromise the main-track spine:

- TermiX requires an Agent Advantage Report with at least three real tasks run with and without an agent, including time, cost, output quality, attached outputs, and at least one trading, stock, or security task.
- Altana requires live onchain transactions, agent-owned wallets, scoped sessions, spend caps, expiry, visible revocation, and wallet addresses in the submission.
- PancakeSwap requires a real benefit to traders or liquidity providers without putting user funds at risk.

These tracks will be treated as explicit scope decisions, not assumed deliverables.

---

## 2. Product concept to validate before implementation

### Working product thesis

A proof-of-work marketplace for BNB agents: users do not merely browse agent descriptions; they inspect evidence, run a bounded test, and hire with clear permissions, cost, and outcome states.

### Simple focus

The marketplace must carry BNB Chain's central product focus: make finding, understanding, comparing, and hiring an onchain agent as easy as possible.

Product promise:

> Find the right onchain agent. Understand it quickly. Hire it safely.

Every feature must reduce friction in at least one of four actions:

- Finding an appropriate agent
- Understanding what it does and what it can access
- Comparing it against alternatives using evidence
- Hiring it with clear permissions, cost, and outcome states

Features that do not strengthen one of these four actions are deferred unless they are required for safety, verification, or hackathon compliance.

### Usability standard

Simple means outcome-first, jargon-free, wallet-late, and usable by someone with no BNB Agent Studio or blockchain expertise. A user must be able to enter, understand the available jobs, choose an agent, and complete a hire without outside instructions.

The interface must:

- Start with the user's job rather than agent or protocol terminology.
- Explain each category in plain language.
- Present one obvious next action at each step.
- Let users explore value before connecting a wallet.
- Translate technical permissions into human-readable consequences.
- Show price, risk, required access, and expected result before approval.
- Use sensible defaults without removing user control.
- Keep ERC-8004, RPC, MCP, x402, and infrastructure details behind progressive disclosure.
- Make failures understandable and recoverable.
- Avoid sending users to documentation to complete the main journey.
- Work on mobile as well as desktop.

Technical evidence remains available for advanced users, but it must not be the entry point or a prerequisite for hiring.

### Usability verification

Simplicity is verified through a cold-start task, not by builder opinion. A person who has not seen the product receives no documentation, product tour, or developer explanation and is asked to find the right job category, choose between two agents, understand one agent's capability, and reach the approval screen.

The test records whether the person can:

1. Explain what the marketplace does after seeing the landing page.
2. Identify the appropriate category.
3. Explain what the selected agent does.
4. Compare two agents using the evidence shown.
5. Find cost, permissions, and risks.
6. Explain what could go wrong.
7. Reach the wallet approval step.
8. Explain what they are about to approve.

Pass conditions:

- The main journey completes within two minutes.
- The user reaches no dead-end screen.
- Documentation is not required.
- Wallet connection is not required before the user understands the job.
- No unexplained technical term blocks progress.
- Every approval screen states the action, asset, limit, cost, and consequence.
- Failure states explain what happened and what the user can do next.
- The user can explain the decision, not merely click through it.

Failed comprehension is treated as a product defect, not user error.

---

### Target user

A BNB user who has a concrete DeFi monitoring or automation need but cannot confidently evaluate which agent is safe, live, capable, or worth paying for.

### Core pain

Agent discovery is fragmented across social posts, repositories, and product pages. Users cannot reliably compare capabilities, current availability, prior performance, execution cost, or permissions before hiring.

### Durable product object

`Agent Listing` is the marketplace object. It combines:

- ERC-8004 identity
- category and capabilities
- live status
- creator/owner
- supported tools and chains
- pricing and limits
- evidence-backed performance history
- permissions required
- test-run availability
- hiring/payment rules

`Job` is the execution object. It records the request, selected agent, permissions, execution events, outputs, cost, timestamps, proof links, and final state.

### Core workflow

The MVP is agent-first and category-first. The landing experience presents the four required DeFi jobs as the primary entry points. The user selects a category, optionally searches within it, compares agents, tests, hires, and tracks the result. Task posting, open bidding, automatic agent matching, and wallet-first onboarding are deferred until the direct hiring journey is stable.

`Choose job category → Search/filter agents → Inspect evidence → Compare → Run bounded test → Connect wallet when required → Hire → Track execution → Verify result and payment`

### Category workspace rule

Each of the four required categories is a job-specific operating workspace, not a tab leading to an agent-card grid. A workspace must remain useful even when no verified agent is currently listed.

Each workspace includes:

- The concrete job the user wants completed
- Plain-language explanation of the job and its risks
- Supported protocols, positions, inputs, and trigger conditions
- What a compatible agent may and may not do
- Live protocol or market context where available
- Verified agent supply, with evidence, pricing, permissions, and availability
- The test, approval, execution, and result-verification path
- Recent jobs and evidence when activity exists
- A transparent no-agent state when supply is absent
- Requirements and submission path for builders who want to provide an agent

A no-agent state must never fabricate listings, activity, ratings, or performance. It should explain the category, show the qualification requirements, and provide a legitimate path for agent supply to enter the marketplace.

The four workspaces are:

- Rebalancing: manage PancakeSwap liquidity positions within declared targets.
- Grid Trading: create and manage bounded grid strategies with explicit limits.
- Yield Optimisation: compare live opportunities and route approved capital within constraints.
- Health Factor Monitoring: monitor lending positions and trigger approved alerts or protective actions.

---

### Demo moment

A first-time user enters the Rebalancing workspace, selects a live PancakeSwap liquidity position, compares verified rebalancing agents using real evidence, approves a bounded rebalance, and sees the confirmed before/after position with transaction proof. The same marketplace must expose real executable paths for grid trading, yield optimisation, and health-factor monitoring, with no mock agent presented as live.

### Candidate name/domain gate

Product name locked: **Bearing**.

Recommended domain contract: **bearingagents.com**. It is currently unregistered in RDAP and has no DNS record in this check. This is not a purchase or registration confirmation; availability must be rechecked at the registrar immediately before registration.

Rejected domain candidates:

- `bearing.ai`: active existing site
- `bearing.market`: registered
- `getbearing.com`: active existing site
- `bearing.app`: registered
- `bearingprotocol.com`: technically available in this check but implies infrastructure rather than a marketplace

Bearing's identity should feel like a trusted place for making an agent decision: quiet, directional, and evidence-led. Avoid generic AI robot imagery, crypto-neon styling, and a logo that is only a letter in a rounded square.

---

## 2A. OKX.AI benchmark findings

OKX.AI is the chosen marketplace benchmark. It is useful as a reference for marketplace mechanics, not as a source of truth for agent quality or a visual template to copy.

### Observed benchmark surfaces

- Agent listings expose category, online availability, rating, positive rate, total sold, price, and a direct try/hire action.
- Agent discovery supports online-only filtering, categories, and sorting.
- The task marketplace exposes total volume, task counts, completed/in-progress counts, recent tasks, status, agent, timestamp, and price.
- The operating model separates users/task requesters, agent service providers, and evaluators/dispute arbitrators.
- The stated workflow covers task posting, trustless escrow, work delivery, review/resolution, and payment.
- The product positions identity and reputation as portable across future jobs.

The displayed counters, ratings, and marketing claims are recorded as observed site content only. They are not independent proof of adoption, agent quality, or settlement reliability.

### What we borrow

- Clear listing cards with price, availability, category, and action.
- A separate task/job history surface.
- Visible lifecycle states from request through completion.
- Explicit roles and responsibility boundaries.
- Marketplace-level trust and dispute concepts.

### What we improve for the BNB challenge

- Replace weak or opaque reputation with ERC-8004 identity and evidence provenance.
- Show category-specific performance and execution traces, not only ratings and total sales.
- Expose permissions, spend caps, slippage, and required wallet actions before activation.
- Separate live onchain evidence, marketplace-observed evidence, fixture data, and self-reported claims.
- Make all four required BNB categories equally deep.
- Show before/after protocol state and transaction receipts for real DeFi jobs.
- Keep the marketplace non-custodial and make payment/job status independently visible.
- Add a bounded test-run step before hiring where the agent supports it.

### Benchmark-derived acceptance criteria

An agent listing is incomplete unless a user can see:

- What the agent does
- Whether it is currently live
- What it costs
- What permissions it requires
- What evidence supports its claims
- What a recent job produced
- What happens if the job fails
- How to test or activate it

The marketplace must also provide a task/job history where a user can inspect the full lifecycle rather than only the final success label.

---

## 2B. Design plan

### Surface archetype

The product uses a `Decide/Learn → Operate` progression:

- Landing: explain the simple promise and point users toward the four jobs.
- Category workspace: help users understand one job and decide which agent to hire.
- Agent detail/compare: expose evidence, permissions, cost, and risk.
- Job surface: show live execution state, receipts, and next actions.

The marketplace must feel like a serious decision instrument, not a crypto dashboard, agent social feed, or generic SaaS admin panel.

### Visual direction

- Canvas: near-black `#08090a`
- Panels: restrained dark surfaces with hairline borders
- Text: high-contrast neutral ink with muted secondary hierarchy
- Accent: one indigo action color
- Status: restrained green, amber, and red only for truthful state
- Typography: Inter or Geist for interface text, mono for IDs, hashes, timestamps, and machine-readable evidence
- Numbers: tabular figures for price, latency, counts, and performance
- No gradients, neon crypto styling, fake charts, decorative metric slabs, pill-badge spam, or template feature grids

### Composition

The primary marketplace composition is a **decision lane**:

1. Job context and plain-language objective
2. Live state and constraints
3. Agent supply and comparison
4. Evidence ledger
5. Clear activation action

The category workspace should not lead with a hero illustration or a grid of equal cards. It should lead with the job the user came to solve, then make the available agent decisions legible.

### Signature interaction

The signature is the **evidence-backed agent decision**: a user can move from a plain-language job to a side-by-side comparison where capability, live status, recent execution, permissions, cost, and risk are aligned in one readable surface. The memorable moment is the clarity of the decision, not animation or decorative chain graphics.

### Information architecture

Required product surfaces:

- `/`: sparse promise and four job entry points
- `/workspace/[category]`: category workspace with job context, live state, agent supply, and qualification path
- `/agents/[id]`: detailed agent record and evidence
- `/compare`: side-by-side decision surface
- `/jobs/[id]`: execution timeline, result, receipt, and failure/dispute state
- `/submit-agent`: provider submission and verification requirements
- `/about/evidence`: concise explanation of evidence labels and trust model

### Interaction and state requirements

Every core surface must have designed states for:

- Loading
- No verified agents
- Agent offline
- Stale data
- Partial data
- Comparison selection
- Test available/unavailable
- Wallet required
- Approval pending
- Execution in progress
- Confirmed success
- Failed execution
- Timeout
- Cancellation
- Payment pending or failed

Empty and unavailable states must explain the next useful action. Disabled primary actions must look disabled and state why.

### Responsive and accessibility requirements

- Mobile-first composition with no horizontal comparison overflow that hides critical fields.
- Keyboard-visible focus states.
- Semantic headings and landmarks.
- Accessible labels for icon-only controls.
- Color is never the sole indicator of status.
- Reduced-motion behavior removes non-essential transitions while preserving state clarity.
- Touch targets remain usable on mobile.

### Design review gates

Before implementation:

- Approve the surface archetype, composition, tokens, type hierarchy, and signature interaction.
- Confirm the landing and product shell share one visual system.
- Reject any design that reads as a generic agent directory or dashboard template.

Before UI completion:

- Run the complete browser journey.
- Inspect desktop and mobile screenshots visually.
- Check empty, loading, error, and disabled states.
- Verify that evidence remains readable before decorative polish.
- Remove one unnecessary visual accessory before sign-off.

---

## 3. Trust model

The product must answer five questions before hiring:

1. What does this agent claim to do?
2. Is the agent live and identifiable?
3. Has it actually performed this kind of work?
4. What will it be allowed to do?
5. What happens if the task fails or produces a bad result?

### Trust features

- ERC-8004 identity and ownership display
- Category-specific capability schema
- Last-seen/live-status signal
- Recent job history with timestamps and outcomes
- Attached input/output examples
- Transaction and explorer links where applicable
- Cost, latency, and permission disclosure
- Bounded sandbox/test run
- Side-by-side evidence comparison
- Explicit execution state machine
- Payment state shown separately from task success
- Failure, refund, and dispute states based on the actual payment protocol, with testnet settlement during MVP validation
- No unsupported star ratings or fabricated performance metrics

### Evidence labels

Every claim must be labelled as one of:

- Live onchain evidence
- Live external API evidence
- Marketplace-observed execution evidence
- Curated fixture/demo evidence
- Agent self-reported claim

The UI must not present fixture-backed data as live production proof.

---

## 4. Scope

### MVP must include

- Four equal-depth category surfaces
- Search, category filtering, and sorting
- Agent listing and detail pages
- Evidence panel with source labels
- Compare flow for at least two agents
- Bounded test-run flow
- Hire flow with explicit permissions, cost, and confirmation state
- Job history and execution trace
- Success, failure, timeout, and cancellation states
- At least one real BNB-compatible execution path
- Testnet-safe wallet/payment boundary with real testnet settlement
- Public deployment suitable for judging
- Documentation and submission evidence

### MVP may include if it strengthens the proof

- 8004scan API enrichment
- ERC-8004 registration lookup
- x402 payment adapter
- Altana partner-track integration
- TermiX Agent Advantage Report
- PancakeSwap-safe read-only or capped test flow

### Explicit non-goals

- Building hundreds of agents
- Creating a general-purpose autonomous hedge fund
- Custodying user funds
- Unbounded agent permissions
- Mainnet trading with real user funds
- A social feed or generic AI-agent directory
- Fake reviews, synthetic transaction history, or invented performance metrics
- Supporting every chain
- Building a full partner-track stack before the main marketplace journey works

---

## 4A. Agent supply and execution plan

The marketplace is the submitted product, but it must be backed by a small supply of real, executable agents. We will not present empty listings or mock agents as live supply.

### Flagship agent

Build and operate our own real PancakeSwap liquidity-rebalancing agent.

Initial workflow:

1. Read a live PancakeSwap liquidity position.
2. Evaluate whether the position is outside its declared target range or otherwise meets a user-defined rebalance condition.
3. Produce a proposed rebalance with token amounts, slippage, gas estimate, permissions, and spend cap.
4. Require explicit user approval.
5. Pass the pre-transaction security gate covering permissions, transaction construction, slippage, spend caps, wallet boundaries, failure behavior, and audit logging.
6. Execute a bounded real transaction, beginning on BNB testnet unless a later gate explicitly approves mainnet.
7. Read the resulting position and transaction receipt.
8. Persist the before/after state, execution trace, transaction hash, and outcome classification.

The agent must never have unrestricted custody or authority. It may act only on the selected position and within the approved range, slippage, token amount, and spend limits.

### Supporting agents

We will integrate verified live agents for the remaining three categories rather than build three separate agent systems from scratch:

- Grid Trading
- Yield Optimisation
- Health Factor Monitoring

The flagship rebalancing agent is built and operated by us. Supporting agents may be composed from Agent Studio production skills or integrated from live partner/reference agents, but every integration must be personally verified before it is listed. The source and execution ownership of each agent must be recorded in the listing and labelled honestly.

Each supporting agent must have:

- A live BNB Smart Chain identity or verifiable live endpoint
- A category-specific capability contract
- A real invocation path
- Defined permissions and limits
- Observable result or execution evidence
- A failure and timeout state
- The same marketplace listing, comparison, test, hire, and job-record interface as the flagship agent

We will not list a category merely to fill the UI. If an integrated agent fails verification, that category remains blocked until a different real agent is sourced and tested.
### Equal-depth rule

Equal depth means each category has real listing data, capability details, evidence, testability, and an executable job path. It does not mean every category needs the same DeFi protocol or the same write action.

- Rebalancing: real bounded PancakeSwap write path
- Grid Trading: real bounded order-management path, preferably testnet
- Yield Optimisation: live opportunity analysis plus bounded approved allocation path
- Health Factor Monitoring: live position monitoring plus real alert and, where safe, approved protective action

If a supporting category cannot meet the live-execution bar, we must either source a real agent or reduce the claimed capability. We must not downgrade it silently into a mock while still presenting it as live.

### Shared agent interface

The marketplace will normalize different agents behind a common contract:

- `describeCapabilities()`
- `getRequirements()`
- `quote(request)`
- `test(request)`
- `hire(request, permissionPolicy)`
- `getJobStatus(jobId)`
- `getEvidence(jobId)`
- `cancel(jobId)` where supported

The interface describes behavior, not implementation. Each adapter remains responsible for protocol-specific validation and transaction handling.

### Agent build order

1. Define the common agent contract.
2. Build and verify the PancakeSwap rebalancing agent.
3. Connect it to the marketplace end to end.
4. Add the other three real category agents or verified integrations.
5. Confirm equal-depth listing and execution evidence.
6. Only then add optional partner-track integrations.

---

## 5. Data and domain design

### Core entities

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
- `User/Wallet`

### Agent lifecycle

`discovered → validated → listed → paused → delisted`

### Job lifecycle

`draft → test_requested → test_completed → hire_pending → hired → running → succeeded`

Terminal or exceptional states:

- `failed`
- `timed_out`
- `cancelled`
- `payment_pending`
- `payment_held`
- `payment_released`
- `refund_pending`
- `refunded`
- `disputed`

Payment status must never be inferred from job success.

### Data-quality rules

- Every listed agent has a source and last-updated timestamp.
- Every performance record identifies whether it is live, observed, or fixture-backed.
- Every category has the same minimum listing schema.
- Stale external data is visibly marked stale.
- Missing evidence is shown as missing, not replaced with optimistic copy.

---

## 6. Proposed architecture

### Application layers

1. Marketplace UI
2. Marketplace API and validation layer
3. Domain services for listings, evidence, test runs, jobs, and payments
4. Agent execution adapters:
   - 8004scan/ERC-8004
   - BNB RPC/explorer
   - Agent Studio execution
   - x402 or another real payment protocol
   - optional Altana/PancakeSwap/TermiX integrations
5. PostgreSQL persistence
6. Observability and audit log

### Adapter rule

All external services sit behind typed interfaces. The core product must remain testable with deterministic fixtures, while the UI labels whether the current result came from a live adapter or a fixture.

### Deployment assumptions

- Public HTTPS deployment
- Environment variables stored only in protected deployment configuration
- No secrets committed to Git
- Testnet-first transaction policy
- Database migrations run explicitly and verified
- Health/readiness endpoint and smoke test available

Final hosting provider and deployment target are selected only after environment inspection.

---

## 7. Documentation deliverables

These files are required before implementation begins. They must remain current.

- `README.md`
  - product overview
  - screenshots/demo link once available
  - local setup
  - environment variables without secret values
  - database setup and migrations
  - test and lint commands
  - live deployment URL
  - known limitations

- `HANDOFF.md`
  - current state
  - completed and verified slices
  - exact next task
  - known bugs and risks
  - decisions made
  - environment/deployment notes
  - test results
  - how a fresh agent resumes safely

- `PRODUCT_SPEC.md`
  - thesis, users, workflow, acceptance criteria, scope, non-goals

- `ARCHITECTURE.md`
  - component diagram, data flow, adapters, persistence, deployment

- `SECURITY.md`
  - wallet, permissions, payment, secrets, abuse, data, and threat boundaries

- `DEMO_SCRIPT.md`
  - exact live execution path, live inputs, proof moments, fallback path, timing
  - test fixtures are documented only for automated tests, never as live product evidence

- `SUBMISSION_CHECKLIST.md`
  - event criteria, required URLs, public-access check, video/screenshots, partner-track evidence

- `DECISIONS.md`
  - dated architecture and scope decisions with rejected alternatives

- `AGENT_DATA_CONTRACT.md`
  - required listing fields, evidence provenance, freshness, and validation rules

- `OPERATIONS.md`
  - deployment, migrations, health checks, logs, rollback, and incident notes

---

## 8. Implementation sequence after plan approval

No task below begins until the plan and product name/domain contract are approved.

### Phase 0: Freeze the contract

- Confirm main-track-only versus partner-track scope.
- Select product name and domain/handle strategy.
- Confirm target user and demo scenario.
- Confirm whether real agent execution is available and which category starts the spine.
- Create the documentation skeleton only.

Exit gate: product contract, scope, and documentation skeleton approved.

### Phase 1: Repository and environment foundation

- Create a clean project root.
- Establish TypeScript, linting, formatting, test runner, and environment validation.
- Add database schema/migration tooling.
- Add safe fixture loading.
- Add CI checks.

Exit gate: clean install, test command, lint command, and migration command work.

### Phase 2: Domain model and evidence rules

- Implement entities and lifecycle enums.
- Add validation for four categories.
- Implement evidence provenance and freshness.
- Add unit tests for invalid transitions and misleading/missing evidence.

Exit gate: domain tests pass and persisted state survives restart.

### Phase 3: Marketplace discovery

- Build category navigation.
- Implement search/filter/sort.
- Build equal-depth listing cards.
- Add empty, stale, unavailable, and error states.
- Add accessible responsive layout.

Exit gate: a user can find all four categories without a dead end.

### Phase 4: Listing, comparison, and trust surfaces

- Build detailed agent pages.
- Add evidence timeline and source labels.
- Add comparison view.
- Display permissions, cost, latency, and live status.

Exit gate: a user can make an informed comparison without reading documentation.

### Phase 5: Test-run and execution spine

- Add bounded test-run request.
- Implement deterministic mock adapter first.
- Add one live BNB-compatible adapter.
- Persist execution events and outputs.
- Add success/failure/timeout handling.

Exit gate: test run works end to end with a visible trace and honest evidence labels.

### Phase 6: Hire and payment boundary

- Add wallet connection only where required.
- Present permission and cost confirmation.
- Implement testnet or simulator payment adapter.
- Separate payment states from job states.
- Add cancellation/refund behavior.

Exit gate: no user can mistake a simulated or testnet payment for a mainnet settlement.

### Phase 7: Optional partner-track slice

Choose only after the main spine is stable:

- TermiX: run and document three with/without comparisons.
- Altana: implement scoped sessions, caps, expiry, revocation, and live explorer evidence.
- PancakeSwap: add a safe, capped, non-custodial benefit path.

Exit gate: partner claims are backed by actual evidence and do not weaken the main submission.

### Phase 8: Public hardening

- Deploy publicly.
- Run database readback and restart tests.
- Verify all four categories and the full journey from a clean browser.
- Run security and abuse checks.
- Capture screenshots/video only from verified behavior.
- Complete submission checklist.

Exit gate: public URL is functional, reproducible, and judge-ready.

---

## 9. Verification strategy

### Automated

- Unit tests for domain transitions and evidence classification
- API contract tests
- Database migration and restart tests
- Adapter tests with fixtures
- UI tests for search, comparison, test run, hire, and failure states
- Accessibility checks
- Lint, typecheck, and production build

### Manual acceptance tests

- New user discovers each of four categories.
- Each category has comparable depth and evidence.
- User can compare at least two agents.
- User can distinguish live, observed, fixture, and self-reported data.
- User can run a bounded test.
- User can see what permissions and cost are involved before hiring.
- User can follow a job from request to result.
- Failure does not appear as success.
- Payment status is independently visible.
- Public deployment works without developer-only setup.

### Evidence commands

The final report must include real outputs for:

- test suite
- lint/typecheck
- production build
- migration status
- database readback
- deployment health check
- public route smoke test
- transaction/explorer links where applicable

---

## 10. Risks and fallback paths

- No reliable live agent API: pause that category's listing until a real live-on-BSC agent is sourced and verified. Test fixtures may support automated tests only and must not power the public execution flow.
- 8004scan access delayed: implement an adapter with a stable contract and use permitted public/onchain data until credentials arrive.
- Agent Studio integration unstable: preserve the same execution interface with a deterministic test adapter and one verified live path.
- Payment integration blocked: pause the live hiring/payment path and document the blocker; do not substitute a simulated product flow or claim production settlement.
- Partner-track complexity threatens the main journey: drop the partner track and finish the main marketplace.
- Too many categories create shallow pages: reduce listing count, not category coverage. All four categories remain first-class.
- Time pressure: cut social features, recommendations, advanced analytics, and multi-chain support before cutting evidence and end-to-end hiring.

---

## 11. Approval gates

### Gate A: Product contract

Approve target user, thesis, four-category scope, demo moment, product name, and non-goals.

### Gate B: Architecture

Approve stack, data model, external adapters, deployment target, and payment boundary.

### Gate C: Working spine

Require verified discovery, comparison, test run, hire, trace, and result states before polish.

### Gate D: Submission readiness

Require public access, real verification outputs, accurate claims, complete markdowns, and a rules-by-rules evidence map.

---

## 12. Immediate next action

Review and approve or revise:

1. The proof-of-work marketplace thesis.
2. The target user.
3. The four-category requirement as non-negotiable.
4. The proposed demo moment.
5. Main track only versus adding TermiX, Altana, or PancakeSwap.
6. Product name and identity direction.
7. Proposed stack and deployment assumptions.

Only after these decisions are resolved should the documentation skeleton be created and implementation begin.
