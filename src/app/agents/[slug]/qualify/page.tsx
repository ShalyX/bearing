import Link from "next/link";
import { WorkspaceNav } from "@/components/WorkspaceNav";
import { readPosition, readPositionOwner, verifyBnbRpc } from "@/lib/integration-status";

export const dynamic = "force-dynamic";

export default async function QualificationPage({ searchParams }: { searchParams?: Promise<{ owner?: string | string[]; tokenId?: string | string[] }> }) {
  const query = searchParams ? await searchParams : {};
  const owner = Array.isArray(query.owner) ? query.owner[0] : query.owner || "";
  const tokenId = Array.isArray(query.tokenId) ? query.tokenId[0] : query.tokenId || "";
  const valid = /^0x[0-9a-fA-F]{40}$/.test(owner) && /^\d+$/.test(tokenId);
  const [chain, position, positionOwner] = valid ? await Promise.all([verifyBnbRpc(), readPosition(tokenId), readPositionOwner(tokenId)]) : [null, null, null];
  const ownerMatches = Boolean(positionOwner?.ok && positionOwner.owner.toLowerCase() === owner.toLowerCase());
  const qualified = Boolean(chain?.reason === "rpc_verified" && position?.ok && positionOwner?.ok && ownerMatches);

  return (
    <main className="market-shell workspace-page">
      <WorkspaceNav section="Qualification / read-only" network="BNB mainnet" />
      <div className="workspace-body">
        <Link href={`/agents/pancake-position-keeper?owner=${owner}&tokenId=${tokenId}`} className="workspace-back">← Return to position dossier</Link>
        <header className="workspace-header"><p className="workspace-kicker">Read-only qualification</p><h1>{valid && qualified ? <>Position<br />qualified.</> : <>Evidence<br />review.</>}</h1><p className="workspace-lede">A bounded check of the selected wallet, position token, and current BNB Chain evidence. This screen authorizes nothing.</p></header>
        <section className={`qualification-verdict ${qualified ? "is-qualified" : "is-unqualified"}`}><span className="qualification-dot" /><div><strong>{valid ? (qualified ? "Ownership-qualified" : "Qualification did not pass") : "Incomplete qualification request"}</strong><p>{qualified ? "The selected wallet currently owns this position token and the chain reads are live-verified." : "No execution path was opened. Resolve the evidence gap before considering any next step."}</p></div></section>
        <dl className="qualification-facts"><div><dt>Wallet</dt><dd>{valid ? `${owner.slice(0, 10)}…${owner.slice(-8)}` : "Invalid or missing"}</dd></div><div><dt>Position token</dt><dd>{valid ? tokenId : "Invalid or missing"}</dd></div><div><dt>Chain</dt><dd>{chain?.chainId === "0x38" ? "BNB Smart Chain" : "Not verified"}</dd></div><div><dt>Checked block</dt><dd>{chain?.latestBlock || "Not available"}</dd></div><div><dt>Owner read</dt><dd>{positionOwner?.ok ? "Returned" : "Failed"}</dd></div><div><dt>Match</dt><dd>{ownerMatches ? "Confirmed" : "Not confirmed"}</dd></div></dl>
        <p className="workspace-empty">Qualification is request-time evidence only. Bearing does not store this result, sign transactions, move funds, or claim future performance.</p>
        <Link className="workspace-link" href={`/agents/pancake-position-keeper/propose?owner=${owner}&tokenId=${tokenId}`}>Continue to bounded proposal ↗</Link>
      </div>
    </main>
  );
}
