import Link from "next/link";
import { MarketNav } from "@/components/MarketNav";
import { agents } from "@/lib/agents";
import { services } from "@/lib/services";

export default function Home() {
  const liveAgents = agents.filter((agent) => agent.status === "online");
  return (
    <main className="market-shell">
      <a className="skip-link" href="#main-content">Skip to marketplace overview</a>
      <MarketNav />
      <section className="market-hero" id="main-content" aria-labelledby="hero-title">
        <div className="market-hero-copy">
          <p className="eyebrow">Bearing / BNB testnet</p>
          <h1 id="hero-title">Find the right read.<br /><span>Keep the proof.</span></h1>
          <p className="market-hero-lede">A working market for onchain agents. Compare the boundary, run one bounded check, and keep the evidence trace.</p>
          <div className="market-actions">
            <Link className="button button-primary" href="/marketplace">Explore agents <span aria-hidden="true">→</span></Link>
            <Link className="button button-secondary" href="/about/evidence">How evidence works</Link>
          </div>
        </div>
        <aside className="market-hero-panel" aria-label="Marketplace status">
          <div className="panel-status"><i aria-hidden="true" />Network live</div>
          <dl>
            <div><dt>Listed agents</dt><dd>{agents.length}</dd></div>
            <div><dt>Live endpoints</dt><dd>{liveAgents.length}</dd></div>
            <div><dt>Safety default</dt><dd>Read-only</dd></div>
          </dl>
          <p>Every live call records the BNB block and leaves a durable Bearing evidence job.</p>
        </aside>
      </section>
      <section className="market-proof-strip" aria-label="How Bearing works">
        <div><span>01</span><strong>Pick a job</strong><p>Start with the outcome you need.</p></div>
        <div><span>02</span><strong>Check the boundary</strong><p>See inputs, permissions, and limits first.</p></div>
        <div><span>03</span><strong>Run the read</strong><p>Leave with a trace, not a black box.</p></div>
      </section>
      <section className="market-featured" aria-labelledby="featured-title">
        <div className="section-heading"><div><p className="eyebrow">Available now</p><h2 id="featured-title">What can you check right now?</h2></div><Link href="/marketplace">Browse all agents <span aria-hidden="true">→</span></Link></div>
        <div className="featured-grid">
          {agents.map((agent) => {
            const service = services.find((item) => item.agentSlug === agent.slug);
            return <Link href={`/agents/${agent.slug}`} className="featured-agent" key={agent.slug}>
              <div className="featured-agent-top"><span>{agent.category}</span><span className={agent.status === "online" ? "status-live" : "status-pending"}>{agent.status === "online" ? "Live" : "Pending"}</span></div>
              <h3>{agent.name}</h3>
              <p>{agent.note}</p>
              <footer><span>{service?.execution === "proposal" ? "Proposal only" : "Read-only"}</span><b>Open profile →</b></footer>
            </Link>;
          })}
        </div>
      </section>
      <footer className="market-footer"><span>Bearing marketplace</span><span>Evidence before execution · BNB testnet</span></footer>
    </main>
  );
}
