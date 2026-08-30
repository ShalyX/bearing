import Link from "next/link";
import { previewAgentAdapter } from "@/lib/agent-adapter";
import { db } from "@/lib/db";
import { getServicesForAgent } from "@/lib/services";
import { readOwnedTokenIds, readPosition, readPositionOwner, readTokenMetadata, verifyBnbRpc } from "@/lib/integration-status";

export default async function AgentPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams?: Promise<{ tokenId?: string | string[]; owner?: string | string[]; jobId?: string | string[] }> }) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const requestedTokenId = Array.isArray(query.tokenId) ? query.tokenId[0] : query.tokenId;
  const requestedOwner = Array.isArray(query.owner) ? query.owner[0] : query.owner;
  const requestedJobId = Array.isArray(query.jobId) ? query.jobId[0] : query.jobId;
  const tokenId = requestedTokenId && /^[0-9]+$/.test(requestedTokenId) ? requestedTokenId : "1";
  const ownerAddress = requestedOwner && /^0x[0-9a-fA-F]{40}$/.test(requestedOwner) ? requestedOwner : "";
  const agent = await previewAgentAdapter.get(slug);

  if (!agent) {
    return (
      <main className="dossier-page">
        <Link href="/marketplace" className="dossier-back">← Return to market</Link>
        <p className="dossier-kicker">404 / Agent not found</p>
        <h1>This listing is not in the market yet.</h1>
        <p className="dossier-lede">Bearing does not create a profile for an agent before its identity and endpoint have been checked.</p>
      </main>
    );
  }

  const usageResult = await db.query("SELECT COUNT(*)::int AS uses FROM jobs WHERE agent_slug=$1 AND state IN ('test_completed','succeeded')", [slug]);
  const reviewResult = await db.query("SELECT rating, review_text, created_at FROM agent_reviews WHERE agent_slug=$1 ORDER BY created_at DESC LIMIT 20", [slug]);
  const usageCount = usageResult.rows[0]?.uses ?? 0;
  const reviews = reviewResult.rows as { rating: number; review_text: string; created_at: string }[];
  const averageRating = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : null;
  const walletPositions = ownerAddress ? await readOwnedTokenIds(ownerAddress) : null;
  const agentServices = getServicesForAgent(slug);
  const service = agentServices[0];
  const [position, owner, chain] = await Promise.all([readPosition(tokenId), readPositionOwner(tokenId), verifyBnbRpc()]);
  const tokenMetadata = position.ok ? await Promise.all([readTokenMetadata(position.token0), readTokenMetadata(position.token1)]) : [];
  const liveVerified = position.ok && owner.ok && chain.reason === "rpc_verified" && tokenMetadata.length === 2 && tokenMetadata[0].ok && tokenMetadata[1].ok;
  const invocation = requestedJobId ? await db.query("SELECT id, state, metadata FROM jobs WHERE id=$1 AND agent_slug=$2", [requestedJobId, slug]) : { rowCount: 0, rows: [] };
  const invocationJob = invocation.rowCount ? invocation.rows[0] as { id: string; state: string; metadata: { test?: Record<string, unknown> } } : null;

  return (
    <main className="dossier-page">
      <nav className="dossier-nav"><Link href="/" className="dossier-brand">BRG <i /></Link><span><Link href="/wallet">Wallet</Link> · <Link href="/compare">Compare</Link> · BNB / TESTNET</span></nav>
      <div className="dossier-body">
        <Link href="/marketplace" className="dossier-back">← Return to market</Link>
        <header className="dossier-header">
          <div><h1>{agent.name}</h1></div>
          <div className="dossier-verdict"><span className="verdict-dot" />{liveVerified ? "Read-only source verified" : "Fixture preview"}<span>{liveVerified ? `BNB block ${chain.latestBlock}` : "Live verification pending"}</span></div>
        </header>

        <section className="agent-profile-meta" aria-label="Agent profile summary"><div><span>Rating</span><strong>{averageRating ? `${averageRating} / 5` : "No rating yet"}</strong></div><div><span>Uses</span><strong>{usageCount}</strong></div><div><span>Agent ID</span><strong>{agent.slug}</strong></div><div><span>Network</span><strong>BNB testnet</strong></div></section>
        <section className="profile-services"><div className="profile-section-heading"><span className="block-label">Services</span><h2>Services offered by this agent</h2></div>{service ? <div className="profile-service-card"><div><span className="service-status"><i className="status-dot online" />Online</span><h3>{service.name}</h3><p>{service.description}</p></div><div className="profile-service-side"><strong>{service.price.amount} {service.price.asset} / read</strong><span>{service.execution === "read_only" ? "Read-only" : service.execution}</span><Link href="#run-service">Run service ↗</Link></div></div> : <p className="evidence-empty">No services are listed yet.</p>}</section>
        {service ? <section className="service-contract" id="run-service" aria-label="Service contract"><div><span className="block-label">Contract</span><p>Read-only service. No funds move without explicit approval.</p></div><div className="service-contract-grid"><div><span>Input</span><strong>tokenId: string</strong></div><div><span>Permissions</span><strong>Position · pool · owner reads</strong></div><div><span>Billing</span><strong>Catalog price · settlement pending</strong></div></div><details><summary>Use with your agent</summary><pre>Use {service.name} on PancakeSwap position token ID {tokenId}. Check the price before calling. Ask me for permission before payment. Run one read-only call and show me the result and evidence trace.</pre></details></section> : null}
        <div className="lookup-stack"><form className="position-lookup" action={`/api/agents/${agent.slug}/invoke`} method="post"><label htmlFor="tokenId">Position token ID</label><div><input id="tokenId" name="tokenId" inputMode="numeric" pattern="[0-9]+" defaultValue={tokenId} /><button type="submit">Run service ↗</button></div></form><form className="position-lookup" method="get"><label htmlFor="owner">Discover wallet positions</label><div><input id="owner" name="owner" inputMode="text" pattern="0x[0-9a-fA-F]{40}" placeholder="0x…" defaultValue={ownerAddress} /><button type="submit">Find positions ↗</button></div></form></div>{invocationJob?.metadata?.test ? <section className="invocation-result" aria-label="Invocation result"><div><span className="block-label">Result</span><strong>{String(invocationJob.metadata.test.summary || "Read completed")}</strong></div><div className="result-facts"><span>Token {tokenId}</span><span>BNB block {String(invocationJob.metadata.test.block || "not available")}</span><span>Read-only</span></div><Link href={`/jobs/${invocationJob.id}`}>Open evidence trace ↗</Link></section> : null}{ownerAddress ? <p className="wallet-context">Wallet context attached: {ownerAddress.slice(0, 8)}…{ownerAddress.slice(-6)}{tokenId ? <Link href={`/agents/${agent.slug}/qualify?owner=${ownerAddress}&tokenId=${tokenId}`}>Check this position ↗</Link> : null}</p> : null}{walletPositions?.ok ? <div className="wallet-results"><span>{walletPositions.balance} position{walletPositions.balance === "1" ? "" : "s"} found</span>{walletPositions.tokenIds.map((id) => <Link href={`/agents/${agent.slug}?tokenId=${id}&owner=${walletPositions.owner}`} key={id}>Token {id} ↗</Link>)}</div> : null}
        <section className="dossier-grid" aria-label="Agent evidence summary">
          <div className="dossier-block"><span className="block-label">Capability</span><h2>Range-aware position maintenance.</h2><p>Reads the selected PancakeSwap position, observes its current range, and prepares a rebalance proposal when the configured boundary is reached.</p></div>
          <div className="dossier-block"><span className="block-label">Permissions</span><dl><div><dt>Reads</dt><dd>Position state, pool price, liquidity range</dd></div><div><dt>Can propose</dt><dd>Bounded range update</dd></div><div><dt>Cannot do</dt><dd>Move funds without explicit approval</dd></div></dl></div>
          <div className="dossier-block"><span className="block-label">Evidence</span>{liveVerified && position.ok && owner.ok && tokenMetadata.length === 2 && tokenMetadata[0].ok && tokenMetadata[1].ok ? <div className="evidence-live"><strong>{tokenMetadata[0].symbol} / {tokenMetadata[1].symbol} position read</strong><p>Owner {owner.owner.slice(0, 6)}…{owner.owner.slice(-4)} · fee {position.fee} · ticks {position.tickLower} to {position.tickUpper}</p><p>Liquidity {position.liquidity} · owed {position.tokensOwed0} / {position.tokensOwed1} raw units</p></div> : <div className="evidence-empty"><strong>Evidence packet pending</strong><p>A live endpoint check, real testnet invocation, result, and transaction trace must be recorded before this listing can be treated as verified supply.</p></div>}</div>
        </section>

        {reviews.length ? <section className="review-history" aria-label="Review history"><div><span className="block-label">Reviews</span><strong>★ {averageRating} from {reviews.length}</strong></div>{reviews.map((review) => <blockquote key={`${review.created_at}-${review.review_text}`}><p>“{review.review_text}”</p><cite>{new Date(review.created_at).toLocaleDateString()} · {review.rating}/5</cite></blockquote>)}</section> : null}
        <footer className="dossier-footer"><span>Read-only service</span><span>BNB Smart Chain testnet</span></footer>
      </div>
    </main>
  );
}
