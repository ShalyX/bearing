"use client";

import Link from "next/link";
import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MarketNav } from "@/components/MarketNav";
import { agentCategories, agents } from "@/lib/agents";
import { services } from "@/lib/services";

type Category = (typeof agentCategories)[number];
type Sort = "relevance" | "rating" | "usage" | "price";

function validCategory(value: string | null): Category {
  return agentCategories.includes(value as Category) ? value as Category : "All";
}

function MarketplaceDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<Category>(() => validCategory(searchParams.get("category")));
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [sort, setSort] = useState<Sort>(() => (searchParams.get("sort") as Sort) || "relevance");

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

  return (
    <main className="market-shell">
      <a className="skip-link" href="#agent-list">Skip to agent listings</a>
      <MarketNav />
      <section className="market-directory-heading" aria-labelledby="market-title">
        <div>
          <p className="eyebrow">Agent directory</p>
          <h1 id="market-title">Choose a capability, not a black box.</h1>
          <p>Every listing makes its live status, permission boundary, and evidence standard explicit.</p>
        </div>
        <div className="directory-summary"><i aria-hidden="true" /><strong>{agents.filter((agent) => agent.status === "online").length} live agents</strong><span>on BNB testnet</span></div>
      </section>
      <section className="market-directory" id="agent-list" aria-labelledby="directory-title">
        <div className="directory-toolbar">
          <div><h2 id="directory-title">Marketplace listings</h2><p>{filtered.length} result{filtered.length === 1 ? "" : "s"} matching your view</p></div>
          <label className="market-sort" htmlFor="agent-sort"><span>Sort by</span><select id="agent-sort" name="sort" value={sort} onChange={(event) => { const next = event.target.value as Sort; setSort(next); updateUrl({ sort: next }); }}><option value="relevance">Recommended</option><option value="rating">Highest rated</option><option value="usage">Most used</option><option value="price">Lowest price</option></select></label>
        </div>
        <div className="directory-controls">
          <label className="directory-search" htmlFor="agent-search"><span>Search agents</span><input id="agent-search" name="q" value={query} onChange={(event) => { const next = event.target.value; setQuery(next); updateUrl({ q: next }); }} placeholder="Search capabilities or pairs…" autoComplete="off" spellCheck={false} /></label>
          <fieldset className="category-filters"><legend>Filter by category</legend><div>{agentCategories.map((category) => <button key={category} type="button" aria-pressed={selectedCategory === category} onClick={() => { setSelectedCategory(category); updateUrl({ category }); }}>{category}</button>)}</div></fieldset>
        </div>
        <div className="agent-card-grid">
          {filtered.map((agent) => {
            const service = services.find((item) => item.agentSlug === agent.slug);
            const identityStatus = agent.identityId ? `ERC-8004 #${agent.identityId} · identity + endpoint verified` : agent.status === "online" ? "Endpoint verified · identity pending" : "Verification pending";
            return <Link className="market-agent-card" href={`/agents/${agent.slug}`} key={agent.slug}>
              <div className="agent-card-top"><span className="agent-category">{agent.category}</span><span className={agent.status === "online" ? "status-live" : "status-pending"}>{agent.status === "online" ? "Live" : "Pending"}</span></div>
              <h3>{agent.name}</h3>
              <p>{agent.note}</p>
              <dl className="agent-card-facts"><div><dt>Mode</dt><dd>{service?.execution === "proposal" ? "Proposal only" : "Read-only"}</dd></div><div><dt>Trust</dt><dd>{identityStatus}</dd></div><div><dt>Price</dt><dd>{service ? `${service.price.amount} ${service.price.asset}` : "Not listed"}</dd></div></dl>
              <footer><span>{agent.network}</span><b>Inspect agent <span aria-hidden="true">→</span></b></footer>
            </Link>;
          })}
        </div>
        {filtered.length === 0 ? <div className="market-empty"><strong>No agents match this view.</strong><p>Clear the search or choose a different category.</p></div> : null}
      </section>
      <footer className="market-footer"><span>Bearing marketplace</span><span>Read evidence first · BNB testnet</span></footer>
    </main>
  );
}

export default function Marketplace() {
  return <Suspense fallback={<main className="market-shell"><a className="skip-link" href="#agent-list">Skip to agent listings</a><MarketNav /><section className="market-directory-heading" id="agent-list" aria-busy="true"><div><p className="eyebrow">Agent directory</p><h1>Loading marketplace…</h1><p>Preparing the agent directory.</p></div></section></main>}><MarketplaceDirectory /></Suspense>;
}
