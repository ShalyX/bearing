import Link from "next/link";
import { WorkspaceNav } from "@/components/WorkspaceNav";
import { readOwnedTokenIds, readPosition, readTokenMetadata, verifyBnbRpc } from "@/lib/integration-status";

export const dynamic = "force-dynamic";

export default async function WalletPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return <main className="market-shell workspace-page"><WorkspaceNav section="Wallet overview / read-only" /><div className="workspace-body"><Link href="/" className="workspace-back">← Return to market</Link><h1>Invalid wallet address.</h1></div></main>;
  const [wallet, chain] = await Promise.all([readOwnedTokenIds(address), verifyBnbRpc()]);
  if (!wallet.ok) return <main className="market-shell workspace-page"><WorkspaceNav section="Wallet overview / read-only" /><div className="workspace-body"><Link href="/" className="workspace-back">← Return to market</Link><h1>Wallet read unavailable.</h1><p className="workspace-empty">{wallet.error}</p></div></main>;
  const positions = await Promise.all(wallet.tokenIds.map(async (tokenId) => {
    const position = await readPosition(tokenId);
    if (!position.ok) return { tokenId, position: null, metadata: null };
    const metadata = await Promise.all([readTokenMetadata(position.token0), readTokenMetadata(position.token1)]);
    return { tokenId, position, metadata };
  }));

  return (
    <main className="market-shell workspace-page">
      <WorkspaceNav section="Wallet overview / read-only" network="BNB mainnet" />
      <div className="workspace-body">
        <Link href="/agents/pancake-position-keeper" className="workspace-back">← Position Keeper</Link>
        <header className="workspace-header"><p className="workspace-kicker">Wallet overview</p><h1>Position<br />inventory.</h1><p className="workspace-lede">A bounded, read-only view of the positions this wallet currently exposes through the PancakeSwap manager.</p></header>
        <section className="wallet-overview-meta"><span>Wallet</span><strong>{address.slice(0, 8)}…{address.slice(-6)}</strong><span>Positions</span><strong>{wallet.balance}</strong><span>Evidence</span><strong>{chain.reason === "rpc_verified" ? `BNB block ${chain.latestBlock}` : "Unverified"}</strong><Link className="workspace-link" href={`/agents/pancake-position-keeper?owner=${address}`}>Use this wallet context ↗</Link></section>
        <section className="wallet-position-list"><div className="workspace-supply-head"><span className="workspace-label">Position inventory</span><span>read-only</span></div>{positions.map(({ tokenId, position, metadata }) => <Link href={`/agents/pancake-position-keeper?tokenId=${tokenId}&owner=${address}`} className="wallet-position-row" key={tokenId}><span className="wallet-position-id">{tokenId}</span><span>{position?.ok && metadata?.[0]?.ok && metadata?.[1]?.ok ? `${metadata[0].symbol} / ${metadata[1].symbol}` : "Metadata pending"}</span><span>{position?.ok ? `fee ${position.fee} · ticks ${position.tickLower}–${position.tickUpper}` : "Read failed"}</span><b>↗</b></Link>)}</section>
      </div>
    </main>
  );
}
