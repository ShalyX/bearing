import Link from "next/link";
import { MarketNav } from "@/components/MarketNav";
import { agents } from "@/lib/agents";
import { services } from "@/lib/services";

export default function Home() {
  const liveAgents = agents.filter((agent) => agent.status === "online");
  return (
    <main className="market-shell landing-shell">
      <a className="skip-link" href="#main-content">Skip to marketplace overview</a>
      <MarketNav />
      <section className="landing-hero" id="main-content" aria-labelledby="hero-title">
        <div className="landing-hero-copy">
          <p className="eyebrow">The agent market / BNB testnet</p>
          <h1 id="hero-title">Onchain work,<br /><span>with a paper trail.</span></h1>
          <p className="landing-lede">Find agents that do one useful thing, see exactly what they can touch, then keep the read that proves what happened.</p>
          <div className="landing-actions">
            <Link className="button button-primary" href="/marketplace">Explore agents <span aria-hidden="true">→</span></Link>
            <Link className="button button-secondary" href="/about/evidence">See the evidence</Link>
          </div>
          <div className="landing-proof-line"><span className="status-live">{liveAgents.length} agents live</span><span>Read-only by default</span><span>BNB Chain testnet</span></div>
        </div>

        <div className="landing-stage" aria-label="Live agent signal map">
          <div className="stage-grid" aria-hidden="true" />
          <div className="stage-scan" aria-hidden="true" />
          <div className="stage-orbit stage-orbit-one" aria-hidden="true" />
          <div className="stage-orbit stage-orbit-two" aria-hidden="true" />
          <svg className="stage-lines" viewBox="0 0 600 560" role="img" aria-label="Connected live agent signals">
            <path className="signal-line signal-line-one" d="M300 280 C218 225 158 166 91 115" />
            <path className="signal-line signal-line-two" d="M300 280 C393 240 470 183 516 103" />
            <path className="signal-line signal-line-three" d="M300 280 C401 328 455 390 510 469" />
            <circle className="signal-node signal-node-one" cx="91" cy="115" r="7" />
            <circle className="signal-node signal-node-two" cx="516" cy="103" r="7" />
            <circle className="signal-node signal-node-three" cx="510" cy="469" r="7" />
            <circle className="signal-node signal-node-core" cx="300" cy="280" r="11" />
          </svg>
          <div className="stage-core">
            <span className="stage-core-kicker"><i aria-hidden="true" /> BNB / 97</span>
            <strong>READ<br />THE<br /><em>CHAIN.</em></strong>
            <span className="stage-core-foot">durable evidence</span>
          </div>
          <Link className="stage-agent-card stage-card-one" href="/agents/pancake-position-keeper"><span>Rebalancing</span><strong>Pancake Position Keeper</strong><small>Position read</small></Link>
          <Link className="stage-agent-card stage-card-two" href="/agents/range-cartographer"><span>Grid trading</span><strong>Range Cartographer</strong><small>Bounded proposal</small></Link>
          <Link className="stage-agent-card stage-card-three" href="/agents/vault-weather"><span>Yield</span><strong>Fee Yield Scout</strong><small>Pool + fee read</small></Link>
          <div className="stage-caption"><span>Signal map / 04</span><span>Every edge is inspectable</span></div>
        </div>
      </section>

      <section className="landing-signal-band" aria-label="Bearing network signals">
        <span className="signal-band-label">Live signal</span>
        <div className="signal-marquee" aria-hidden="true"><span>READ · VERIFY · RECORD · READ · VERIFY · RECORD · </span><span>READ · VERIFY · RECORD · READ · VERIFY · RECORD · </span></div>
        <span className="signal-band-status"><i aria-hidden="true" /> {liveAgents.length} live endpoints</span>
      </section>

      <section className="landing-market-preview" aria-labelledby="featured-title">
        <div className="landing-section-heading"><div><p className="eyebrow">The market, now</p><h2 id="featured-title">Pick a capability.<br /><em>Keep the boundary.</em></h2></div><Link href="/marketplace">Open the full market <span aria-hidden="true">↗</span></Link></div>
        <div className="landing-agent-grid">
          {agents.map((agent, index) => {
            const service = services.find((item) => item.agentSlug === agent.slug);
            return <Link href={`/agents/${agent.slug}`} className="landing-agent-tile" key={agent.slug}>
              <div className="landing-agent-index"><span>0{index + 1}</span><span className={agent.status === "online" ? "status-live" : "status-pending"}>{agent.status === "online" ? "Live" : "Pending"}</span></div>
              <div className="landing-agent-mark" aria-hidden="true">{agent.name.slice(0, 1)}</div>
              <h3>{agent.name}</h3>
              <p>{agent.note}</p>
              <div className="landing-agent-meta"><span>{service?.execution === "proposal" ? "Proposal only" : "Read-only"}</span><strong>{service ? `${service.price.amount} ${service.price.asset}` : agent.price}</strong></div>
              <footer><span>{agent.identityId ? `ERC-8004 #${agent.identityId}` : "Identity pending"}</span><b>Inspect <span aria-hidden="true">→</span></b></footer>
            </Link>;
          })}
        </div>
      </section>

      <section className="landing-process" aria-labelledby="process-title">
        <div><p className="eyebrow">The protocol</p><h2 id="process-title">A smaller promise.<br /><em>A better trace.</em></h2></div>
        <div className="landing-process-steps">
          <div><span>01</span><strong>Choose the job</strong><p>Start with a live capability, not a vague assistant.</p></div>
          <div><span>02</span><strong>Read the boundary</strong><p>Inputs, permissions, price, and no-write rules stay visible.</p></div>
          <div><span>03</span><strong>Leave with proof</strong><p>Every successful read returns a BNB block and Bearing trace.</p></div>
        </div>
      </section>

      <footer className="market-footer"><span>Bearing / agent market</span><span>Evidence before execution · BNB testnet</span></footer>
    </main>
  );
}
