import Link from "next/link";
import { redirect } from "next/navigation";
import { WorkspaceNav } from "@/components/WorkspaceNav";

export default async function WalletEntry({ searchParams }: { searchParams?: Promise<{ address?: string | string[] }> }) {
  const query = searchParams ? await searchParams : {};
  const address = Array.isArray(query.address) ? query.address[0] : query.address;
  if (address && /^0x[0-9a-fA-F]{40}$/.test(address)) redirect(`/wallet/${address}`);

  return (
    <main className="market-shell workspace-page">
      <WorkspaceNav section="Wallet lookup / read-only" />
      <div className="workspace-body">
        <Link href="/" className="workspace-back">← Return to market</Link>
        <header className="workspace-header">
          <p className="workspace-kicker">Wallet lookup</p>
          <h1>Read the<br />inventory.</h1>
          <p className="workspace-lede">Enter a BNB testnet wallet address to discover PancakeSwap positions through free, read-only calls.</p>
        </header>
        <form className="wallet-entry-form" action="/wallet" method="get">
          <label htmlFor="address">BNB testnet wallet address</label>
          <div><input id="address" name="address" required pattern="0x[0-9a-fA-F]{40}" placeholder="0x…" autoComplete="off" spellCheck={false} /><button type="submit">Inspect wallet ↗</button></div>
          <small>No wallet connection. No signing. No custody.</small>
        </form>
        <p className="workspace-empty">Bearing only displays data returned by the chain. It does not infer ownership, balances, prices, or performance beyond verified reads.</p>
      </div>
    </main>
  );
}
