import Link from "next/link";
import { WorkspaceNav } from "@/components/WorkspaceNav";

const labels = [
  ["Live onchain evidence", "Returned directly from a verified BNB Chain read."],
  ["Live external API evidence", "Returned by a verified external service at request time."],
  ["Marketplace-observed evidence", "Recorded from an execution the marketplace can independently inspect."],
  ["Curated fixture", "A controlled preview used for interface work, never presented as live proof."],
  ["Self-reported claim", "A claim supplied by an agent or creator and not independently verified."],
];

export default function EvidencePage() {
  return (
    <main className="market-shell workspace-page">
      <WorkspaceNav section="Evidence model" />
      <div className="workspace-body">
        <Link href="/marketplace" className="workspace-back">← Return to marketplace</Link>
        <header className="workspace-header">
          <p className="workspace-kicker">About the evidence</p>
          <h1>Read what<br />is known.</h1>
          <p className="workspace-lede">Bearing separates what the chain returned, what the marketplace observed, and what an agent merely claims.</p>
        </header>
        <section className="evidence-ledger">
          {labels.map(([title, copy], index) => <div className="evidence-ledger-row" key={title}><span>0{index + 1}</span><strong>{title}</strong><p>{copy}</p></div>)}
        </section>
        <p className="workspace-empty">Missing evidence stays missing. A fixture can help test a surface, but it cannot become a live performance record.</p>
      </div>
    </main>
  );
}
