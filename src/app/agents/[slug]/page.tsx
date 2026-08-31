import Link from "next/link";
import { MarketNav } from "@/components/MarketNav";
import { previewAgentAdapter } from "@/lib/agent-adapter";
import { db } from "@/lib/db";
import { getServicesForAgent } from "@/lib/services";

type Search = { tokenId?: string | string[]; pair?: string | string[]; gridLevels?: string | string[]; position?: string | string[]; jobId?: string | string[] };
type EvidenceJob = { id: string; state: string; metadata: { test?: Record<string, unknown> } };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function validTokenId(value: string | undefined) {
  return value && /^\d+$/.test(value) ? value : "11899";
}

export default async function AgentPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams?: Promise<Search> }) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const agent = await previewAgentAdapter.get(slug);
  if (!agent) {
    return <main className="market-shell"><a className="skip-link" href="#main-content">Skip to content</a><MarketNav /><section className="agent-not-found" id="main-content"><p className="eyebrow">Listing unavailable</p><h1>This agent is not in the marketplace.</h1><p>Return to the directory to inspect the available agents.</p><Link className="button button-primary" href="/marketplace">Back to marketplace</Link></section></main>;
  }

  const service = getServicesForAgent(agent.slug)[0];
  const tokenId = validTokenId(first(query.tokenId));
  const pair = first(query.pair)?.replaceAll(" ", "").toUpperCase() || "CAKE/XRP";
  const gridLevels = first(query.gridLevels) || "5";
  const requestedPosition = first(query.position) || "";
  const requestedJobId = first(query.jobId);
  let evidenceJob: EvidenceJob | null = null;
  if (requestedJobId) {
    try {
      const result = await db.query("SELECT id, state, metadata FROM jobs WHERE id=$1 AND agent_slug=$2", [requestedJobId, slug]);
      evidenceJob = result.rowCount ? result.rows[0] as EvidenceJob : null;
    } catch {
      evidenceJob = null;
    }
  }

  const verifiedIdentity = agent.verification.identityVerified;
  const identityStatus = verifiedIdentity ? "ERC-8004 identity verified" : "ERC-8004 identity registration pending";
  const result = evidenceJob?.metadata.test;
  const isGrid = slug === "range-cartographer";
  const isHealth = slug === "health-monitor";

  return (
    <main className="market-shell">
      <a className="skip-link" href="#agent-content">Skip to agent details</a>
      <MarketNav />
      <section className="agent-header" id="agent-content" aria-labelledby="agent-name">
        <Link href="/marketplace" className="back-link">← Back to marketplace</Link>
        <div className="agent-header-grid">
          <div>
            <p className="eyebrow">{agent.category} agent</p>
            <h1 id="agent-name">{agent.name}</h1>
            <p>{agent.description}</p>
          </div>
          <aside className="agent-trust-card" aria-label="Verification status">
            <span className={agent.verification.endpointVerified ? "status-live" : "status-pending"}>{agent.verification.endpointVerified ? "Endpoint live" : "Endpoint pending"}</span>
            <strong>{identityStatus}</strong>
            <p>{agent.verification.endpointVerified ? "Each successful run creates a durable Bearing evidence job." : "This profile remains unverified until its endpoint is checked."}</p>
          </aside>
        </div>
        <dl className="agent-summary-grid"><div><dt>Network</dt><dd>BNB testnet</dd></div><div><dt>Execution</dt><dd>{service?.execution === "proposal" ? "Bounded proposal" : "Read-only"}</dd></div><div><dt>Permissions</dt><dd>{agent.permissions}</dd></div><div><dt>Price</dt><dd>{service ? `${service.price.amount} ${service.price.asset} · ${service.price.unit.replace("per_", "per ")}` : agent.price}</dd></div></dl>
      </section>
      {service ? <section className="agent-content-grid" aria-label="Agent service details">
        <article className="agent-detail-panel">
          <p className="eyebrow">Service contract</p>
          <h2>{service.name}</h2>
          <p>{service.description}</p>
          <dl className="contract-list"><div><dt>Can read</dt><dd>{service.permissions.join(" · ")}</dd></div><div><dt>Cannot do</dt><dd>{service.execution === "proposal" ? "Submit orders, sign, or move funds" : "Sign, trade, borrow, repay, liquidate, or move funds"}</dd></div><div><dt>Evidence</dt><dd>{service.evidence.note}</dd></div></dl>
        </article>
        <aside className="agent-run-panel" id="run-service">
          <p className="eyebrow">Run a testnet read</p>
          <h2>{isHealth ? "Check a lending position" : isGrid ? "Build a bounded grid" : "Inspect LP fee conditions"}</h2>
          {isHealth ? <form action={service.endpoint} method="post" className="agent-form"><label htmlFor="position">BNB testnet wallet address</label><input id="position" name="position" inputMode="text" pattern="0x[0-9a-fA-F]{40}" placeholder="0x…" defaultValue={requestedPosition} autoComplete="off" spellCheck={false} required /><button className="button button-primary" type="submit">Run health check <span aria-hidden="true">→</span></button><small>Opens the Health Monitor’s durable evidence trace.</small></form> : <form action={`/api/agents/${slug}/invoke`} method="post" className="agent-form">{isGrid ? <><label htmlFor="pair">PancakeSwap testnet pair</label><input id="pair" name="pair" defaultValue={pair} placeholder="CAKE/XRP…" autoComplete="off" spellCheck={false} required /><label htmlFor="gridLevels">Proposed grid levels</label><input id="gridLevels" name="gridLevels" type="number" min="3" max="9" step="2" defaultValue={gridLevels} inputMode="numeric" autoComplete="off" required /></> : <><label htmlFor="tokenId">PancakeSwap LP token ID</label><input id="tokenId" name="tokenId" inputMode="numeric" pattern="[0-9]+" defaultValue={tokenId} autoComplete="off" required /></>}<button className="button button-primary" type="submit">Run read-only service <span aria-hidden="true">→</span></button><small>{isGrid ? "Returns a bounded proposal only. No orders are submitted." : "Returns current position and pool conditions. No transaction is created."}</small></form>}
        </aside>
      </section> : null}
      {result ? <section className="evidence-result" aria-label="Latest invocation evidence"><div><p className="eyebrow">Evidence job</p><h2>{String(result.summary || "Read completed")}</h2></div><dl><div><dt>Job</dt><dd>{evidenceJob?.id}</dd></div><div><dt>BNB block</dt><dd>{String(result.block || "Not available")}</dd></div><div><dt>Mode</dt><dd>{String(result.mode || "Read-only")}</dd></div></dl><Link className="button button-secondary" href={`/jobs/${evidenceJob?.id}`}>Open evidence trace</Link></section> : null}
      <section className="agent-schema" aria-labelledby="schema-title"><div><p className="eyebrow">Input</p><h2 id="schema-title">What the agent needs</h2>{service?.inputs.map((input) => <div className="schema-row" key={input.name}><strong>{input.name}</strong><span>{input.required ? "Required" : "Optional"}</span><p>{input.description}</p></div>)}</div><div><p className="eyebrow">Output</p><h2>What you can inspect</h2>{service?.outputs.map((output) => <div className="schema-row" key={output.name}><strong>{output.name}</strong><span>{output.type}</span><p>{output.description}</p></div>)}</div></section>
      <footer className="market-footer"><span>{agent.name}</span><span>Evidence before execution · BNB testnet</span></footer>
    </main>
  );
}
