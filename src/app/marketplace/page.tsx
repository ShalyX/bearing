"use client";

import Link from "next/link";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { agentCategories, agents } from "@/lib/agents";
import { services } from "@/lib/services";

type Category = (typeof agentCategories)[number];
type Sort = "relevance" | "rating" | "usage" | "price";

function validCategory(value: string | null): Category {
  return agentCategories.includes(value as Category) ? value as Category : "All";
}

function agentHref(searchParams: URLSearchParams, slug: string) {
  const next = new URLSearchParams(searchParams.toString());
  next.set("agent", slug);
  return `/marketplace?${next.toString()}`;
}

function MarketplaceDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<Category>(() => validCategory(searchParams.get("category")));
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [sort, setSort] = useState<Sort>(() => (searchParams.get("sort") as Sort) || "relevance");
  const [selectedSlug, setSelectedSlug] = useState(() => searchParams.get("agent") || "");

  const updateUrl = useCallback((changes: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (!value || value === "All" || value === "relevance") next.delete(key);
      else next.set(key, value);
    });
    const suffix = next.toString();
    router.replace(suffix ? `/marketplace?${suffix}` : "/marketplace", { scroll: false });
  }, [router, searchParams]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return agents.filter((agent) => {
      const service = services.find((item) => item.agentSlug === agent.slug);
      const matchesCategory = selectedCategory === "All" || agent.category === selectedCategory;
      const matchesQuery = !term || `${agent.name} ${agent.category} ${agent.note} ${service?.name || ""} ${service?.description || ""}`.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    }).slice().sort((left, right) => {
      const leftService = services.find((item) => item.agentSlug === left.slug);
      const rightService = services.find((item) => item.agentSlug === right.slug);
      if (sort === "rating") return right.rating - left.rating;
      if (sort === "usage") return right.usageCount - left.usageCount;
      if (sort === "price") return Number(leftService?.price.amount || Number.MAX_SAFE_INTEGER) - Number(rightService?.price.amount || Number.MAX_SAFE_INTEGER);
      return Number(right.status === "online") - Number(left.status === "online");
    });
  }, [query, selectedCategory, sort]);

  const selected = filtered.find((agent) => agent.slug === selectedSlug) || filtered[0] || null;
  const selectedService = selected ? services.find((item) => item.agentSlug === selected.slug) : null;
  const identityCopy = selected?.identityId ? `ERC-8004 #${selected.identityId}` : "ERC-8004 registration pending";
  const selectedHref = selected ? `/agents/${selected.slug}` : "/marketplace";
  const runHref = selected ? `${selectedHref}#run-service` : "/marketplace";

  return (
    <main className="market-shell market-app-shell">
      <a className="skip-link" href="#agent-list">Skip to agent listings</a>
      <aside className="market-rail" aria-label="Marketplace navigation">
        <Link href="/" className="rail-brand" aria-label="Bearing home">
          <span className="rail-brand-mark" aria-hidden="true">◆</span>
          <span><strong>Bearing</strong><small>Agent market</small></span>
        </Link>
        <nav className="rail-nav" aria-label="Market sections">
          <Link className="rail-link is-active" href="/marketplace"><span aria-hidden="true">⌕</span>Discover</Link>
          <Link className="rail-link" href="/marketplace#categories"><span aria-hidden="true">▦</span>Categories</Link>
          <Link className="rail-link" href="/wallet"><span aria-hidden="true">◫</span>Wallet</Link>
          <Link className="rail-link" href="/about/evidence"><span aria-hidden="true">◷</span>Activity</Link>
        </nav>
        <div className="rail-caption">Shortcuts</div>
        <nav className="rail-nav rail-shortcuts" aria-label="Marketplace shortcuts">
          <a className="rail-link" href="#agent-list"><span aria-hidden="true">★</span>Live agents</a>
          <a className="rail-link" href="#categories"><span aria-hidden="true">◇</span>Read-only</a>
          <Link className="rail-link" href="/about/evidence"><span aria-hidden="true">↗</span>Evidence</Link>
        </nav>
        <div className="rail-creator">
          <strong>Build an agent</strong>
          <p>Publish a verified capability to the market.</p>
          <Link className="rail-creator-link" href="/submit-agent">For creators <span aria-hidden="true">→</span></Link>
        </div>
      </aside>

      <div className="market-app">
        <header className="market-workspace-topbar">
          <label className="workspace-search" htmlFor="agent-search-top">
            <span aria-hidden="true">⌕</span>
            <span className="sr-only">Search agents</span>
            <input id="agent-search-top" name="q" value={query} onChange={(event) => { const next = event.target.value; setQuery(next); updateUrl({ q: next }); }} placeholder="What do you need an agent to do…" autoComplete="off" spellCheck={false} />
            <kbd>⌘ K</kbd>
          </label>
          <nav className="workspace-links" aria-label="Workspace navigation">
            <Link className="is-current" href="/marketplace">Explore</Link>
            <Link href="/marketplace#categories">Categories</Link>
            <Link href="/about/evidence">How it works</Link>
            <Link href="/submit-agent">For creators</Link>
          </nav>
          <span className="workspace-network"><i aria-hidden="true" /> BNB testnet</span>
        </header>

        <section className="market-app-hero" aria-labelledby="market-title">
          <div>
            <p className="eyebrow">Onchain agent market</p>
            <h1 id="market-title">Find. Run. <em>Trust.</em></h1>
            <p>Live capabilities for BNB Chain, with the boundary and evidence visible before you spend a read.</p>
          </div>
          <dl className="market-app-stats" aria-label="Marketplace totals">
            <div><dt>Live agents</dt><dd>{agents.filter((agent) => agent.status === "online").length}</dd></div>
            <div><dt>Categories</dt><dd>{agentCategories.length - 1}</dd></div>
            <div><dt>Default</dt><dd>Read-only</dd></div>
          </dl>
        </section>

        <section className="market-directory" id="agent-list" aria-labelledby="directory-title">
          <div className="directory-toolbar">
            <div><p className="eyebrow">Discover</p><h2 id="directory-title">Popular agents</h2><p>{filtered.length} result{filtered.length === 1 ? "" : "s"} in the market</p></div>
            <label className="market-sort" htmlFor="agent-sort"><span>Sort by</span><select id="agent-sort" name="sort" value={sort} onChange={(event) => { const next = event.target.value as Sort; setSort(next); updateUrl({ sort: next }); }}><option value="relevance">Recommended</option><option value="rating">Highest rated</option><option value="usage">Most used</option><option value="price">Lowest price</option></select></label>
          </div>
          <div className="directory-controls" id="categories">
            <label className="directory-search" htmlFor="agent-search"><span>Search capabilities</span><input id="agent-search" name="q" value={query} onChange={(event) => { const next = event.target.value; setQuery(next); updateUrl({ q: next }); }} placeholder="Search by job, protocol, or pair…" autoComplete="off" spellCheck={false} /></label>
            <fieldset className="category-filters"><legend>Filter by category</legend><div>{agentCategories.map((category) => <button key={category} type="button" aria-pressed={selectedCategory === category} onClick={() => { setSelectedCategory(category); updateUrl({ category }); }}>{category}</button>)}</div></fieldset>
          </div>

          <div className="market-results-layout">
            <div className="agent-card-grid">
              {filtered.map((agent) => {
                const service = services.find((item) => item.agentSlug === agent.slug);
                const isSelected = selected?.slug === agent.slug;
                const identityStatus = agent.identityId ? `ERC-8004 #${agent.identityId}` : "Identity pending";
                return <Link className={`market-agent-card ${isSelected ? "is-selected" : ""}`} href={agentHref(searchParams, agent.slug)} onClick={() => setSelectedSlug(agent.slug)} aria-current={isSelected ? "page" : undefined} key={agent.slug}>
                  <div className="agent-card-top"><span className="agent-category">{agent.category}</span><span className={agent.status === "online" ? "status-live" : "status-pending"}>{agent.status === "online" ? "Live" : "Pending"}</span></div>
                  <div className="agent-card-identity"><span className="agent-avatar" aria-hidden="true">{agent.name.slice(0, 1)}</span><span><h3>{agent.name}</h3><small>{identityStatus}</small></span></div>
                  <p>{agent.note}</p>
                  <div className="agent-card-tags"><span>{service?.execution === "proposal" ? "Proposal" : "Read-only"}</span><span>{agent.network.replace(" Smart Chain", "")}</span></div>
                  <footer><strong>{service ? `${service.price.amount} ${service.price.asset}` : agent.price}</strong><span>Open agent <span aria-hidden="true">→</span></span></footer>
                </Link>;
              })}
            </div>

            {selected ? <aside className="market-agent-preview" aria-labelledby="selected-agent-title">
              <div className="preview-topline"><span>Selected agent</span><span className={selected.status === "online" ? "status-live" : "status-pending"}>{selected.status === "online" ? "Active" : "Pending"}</span></div>
              <div className="preview-identity"><span className="preview-avatar" aria-hidden="true">{selected.name.slice(0, 1)}</span><div><p className="eyebrow">{selected.category}</p><h2 id="selected-agent-title">{selected.name}</h2><p>by Bearing registry</p></div></div>
              <p className="preview-description">{selected.description}</p>
              <div className="preview-trust"><span className="trust-mark" aria-hidden="true">✓</span><div><strong>{selected.identityId ? "Verified agent" : "Endpoint verified"}</strong><small>{identityCopy}</small></div></div>
              <nav className="preview-tabs" aria-label="Selected agent sections"><a className="is-current" href="#preview-overview">Overview</a><a href="#preview-capabilities">Capabilities</a><a href="#preview-permissions">Permissions</a></nav>
              <div className="preview-sections" id="preview-overview">
                <section><p className="preview-label">About</p><p>{selected.note} {selectedService?.evidence.note}</p></section>
                <section id="preview-capabilities"><p className="preview-label">Capabilities</p><ul>{(selectedService?.permissions || ["read_protocol"]).map((permission) => <li key={permission}>✓ {permission.replaceAll("_", " ")}</li>)}</ul></section>
                <section id="preview-permissions"><p className="preview-label">Boundary</p><p>{selectedService?.execution === "proposal" ? "No orders, signing, or fund movement." : "No signing, trading, borrowing, or fund movement."}</p></section>
              </div>
              <div className="preview-actions"><Link className="button button-secondary" href={selectedHref}>View profile</Link><Link className="button button-primary" href={runHref}>Run this read <span aria-hidden="true">→</span></Link></div>
            </aside> : <div className="market-empty"><strong>No agents match this view.</strong><p>Clear the search or choose a different category.</p></div>}
          </div>
        </section>
        <footer className="market-footer"><span>Bearing / agent market</span><span>Evidence before execution · BNB testnet</span></footer>
      </div>
    </main>
  );
}

export default function Marketplace() {
  return <Suspense fallback={<main className="market-shell market-app-shell"><section className="market-app-hero" aria-busy="true"><div><p className="eyebrow">Onchain agent market</p><h1>Loading marketplace…</h1><p>Preparing live capabilities.</p></div></section></main>}><MarketplaceDirectory /></Suspense>;
}
