import Link from "next/link";
import { redirect } from "next/navigation";

export default async function WalletEntry({ searchParams }: { searchParams?: Promise<{ address?: string | string[] }> }) {
  const query = searchParams ? await searchParams : {};
  const address = Array.isArray(query.address) ? query.address[0] : query.address;
  if (address && /^0x[0-9a-fA-F]{40}$/.test(address)) redirect(`/wallet/${address}`);
  return <main className="workspace-page"><nav className="workspace-nav"><Link href="/" className="workspace-brand">BRG <i /></Link><span>Wallet lookup / read-only</span><span>BNB / MAINNET</span></nav><div className="workspace-body"><Link href="/" className="workspace-back">← Return to market</Link><header className="workspace-header"><p className="workspace-kicker">Wallet lookup</p><h1>Read the<br />inventory.</h1><p className="workspace-lede">Enter a wallet address to discover PancakeSwap positions through free, read-only BNB Chain calls.</p></header><form className="wallet-entry-form" action="/wallet" method="get"><label htmlFor="address">BNB Smart Chain wallet address</label><div><input id="address" name="address" required pattern="0x[0-9a-fA-F]{40}" placeholder="0x…" /><button type="submit">Inspect wallet ↗</button></div><small>No wallet connection. No signing. No custody.</small></form><p className="workspace-empty">Bearing only displays data returned by the chain. It does not infer ownership, balances, prices, or performance beyond verified reads.</p></div></main>;
}
