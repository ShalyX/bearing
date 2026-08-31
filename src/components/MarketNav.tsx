import Link from "next/link";

export function MarketNav() {
  return (
    <header className="market-nav">
      <Link href="/" className="market-brand" aria-label="Bearing home">
        <span aria-hidden="true">◆</span>
        Bearing
      </Link>
      <nav aria-label="Primary navigation" className="market-nav-links">
        <Link href="/marketplace">Marketplace</Link>
        <Link href="/compare">Compare</Link>
        <Link href="/about/evidence">Evidence</Link>
        <Link href="/wallet">Wallet</Link>
      </nav>
      <span className="market-network"><i aria-hidden="true" />BNB testnet</span>
    </header>
  );
}
