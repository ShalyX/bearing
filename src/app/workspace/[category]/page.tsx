import Link from "next/link";
import { agentCategories, getAgentsByCategory, type AgentCategory } from "@/lib/agents";
import { getPancakeIntegrationStatus } from "@/lib/integration-status";

const workspaceCopy: Record<AgentCategory, { title: string; description: string; question: string }> = {
  Rebalancing: { title: "Keep the position in range.", description: "A rebalancing agent watches a concentrated-liquidity position and prepares a bounded range update when the market moves outside the chosen limits.", question: "What can this agent change without approval?" },
  "Grid Trading": { title: "Trade a defined set of levels.", description: "A grid-trading agent works from explicit price levels. Bearing makes the pair, range, order proposal, and limits readable before anything is signed.", question: "What is the maximum proposed exposure?" },
  Yield: { title: "Read yield before moving capital.", description: "A yield agent surfaces protocol conditions and changes. Recommendations are not execution, and the distinction stays visible here.", question: "Which protocol state supports the recommendation?" },
  Health: { title: "See risk before it becomes urgent.", description: "A health-monitoring agent watches lending positions and flags drift. Alert-only agents should not ask for write permissions.", question: "Which position facts produced the alert?" },
};

function toCategory(value: string): AgentCategory | undefined {
  const match = agentCategories.find((category) => category.toLowerCase().replaceAll(" ", "-") === value.toLowerCase());
  return match && match !== "All" ? match : undefined;
}

export default async function WorkspacePage({ params }: { params: Promise<{ category: string }> }) {
  const { category: rawCategory } = await params;
  const category = toCategory(rawCategory);

  if (!category) {
    return <main className="workspace-page"><Link href="/marketplace" className="workspace-back">← Return to market</Link><h1>This workspace is not available.</h1><p>Bearing only opens categories with a defined qualification standard.</p></main>;
  }

  const copy = workspaceCopy[category];
  const categoryAgents = getAgentsByCategory(category);
  const pancakeStatus = getPancakeIntegrationStatus();

  return (
    <main className="workspace-page">
      <nav className="workspace-nav"><Link href="/" className="workspace-brand">BRG <i /></Link><span>Category workspace / {category}</span><span><Link href="/compare">Compare</Link> · <Link href="/submit-agent">Submit agent</Link> · BNB / TESTNET</span></nav>
      <div className="workspace-body">
        <Link href="/marketplace" className="workspace-back">← Return to market</Link>
        <header className="workspace-header"><p className="workspace-kicker">Job workspace / {category}</p><h1>{copy.title}</h1><p className="workspace-lede">{copy.description}</p></header>
        <section className="workspace-grid">
          <div className="workspace-panel workspace-context"><span className="workspace-label">Live context</span><h2>{category === "Rebalancing" && pancakeStatus.configured ? "Read path verified. Write path pending." : "Context connection pending."}</h2><p>{category === "Rebalancing" && pancakeStatus.configured ? "Bearing can read the official PancakeSwap position manager on BNB Chain. Transaction construction and execution remain blocked until the security gate passes." : "This workspace does not invent prices, positions, yields, or health factors. Live context will appear after a verified data adapter is connected."}</p><span className="workspace-state">{category === "Rebalancing" && pancakeStatus.configured ? "Read-only verified" : "Not connected"}</span></div>
          <div className="workspace-panel"><span className="workspace-label">Qualification question</span><h2>{copy.question}</h2><p>Every listed agent must answer this question with inspectable inputs, permissions, and an evidence record.</p><Link href={category === "Rebalancing" ? "/agents/pancake-position-keeper" : "/marketplace"} className="workspace-link">{categoryAgents.length ? "Read available supply ↗" : "View qualification path ↗"}</Link></div>
        </section>
        <section className="workspace-supply"><div className="workspace-supply-head"><span className="workspace-label">Agent supply</span><span>{categoryAgents.length} listing{categoryAgents.length === 1 ? "" : "s"}</span></div>{categoryAgents.length ? categoryAgents.map((agent) => <Link href={`/agents/${agent.slug}`} className="workspace-agent" key={agent.slug}><span className="workspace-agent-name">{agent.name}</span><span>{agent.evidence}</span><b>↗</b></Link>) : <p className="workspace-empty">No verified agents are listed here yet. Builders can enter through the qualification path above.</p>}</section>
      </div>
    </main>
  );
}
