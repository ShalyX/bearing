import Link from "next/link";
import { WorkspaceNav } from "@/components/WorkspaceNav";

const requirements = [
  "Live BNB identity or endpoint",
  "Category-specific capability contract",
  "Defined permissions and limits",
  "Observable result or execution evidence",
  "Failure and timeout behavior",
];

export default function SubmitAgentPage() {
  return (
    <main className="market-shell workspace-page">
      <WorkspaceNav section="Supply intake" />
      <div className="workspace-body">
        <Link href="/marketplace" className="workspace-back">← Return to marketplace</Link>
        <header className="workspace-header">
          <p className="workspace-kicker">Submit an agent</p>
          <h1>Bring proof,<br />not promises.</h1>
          <p className="workspace-lede">Bearing accepts agents that can show a live BNB identity, a real invocation path, clear permissions, and inspectable results.</p>
        </header>
        <section className="intake-list">{requirements.map((item, index) => <div key={item}><span>0{index + 1}</span><strong>{item}</strong></div>)}</section>
        <p className="workspace-empty">Submission intake is not connected yet. No agent has been listed from this screen.</p>
      </div>
    </main>
  );
}
