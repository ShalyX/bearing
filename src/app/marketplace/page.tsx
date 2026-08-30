"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { agentCategories, agents } from "@/lib/agents";
import { services } from "@/lib/services";

type Category = (typeof agentCategories)[number];
type Sort = "relevance" | "rating" | "usage" | "price";

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("relevance");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return agents.filter((agent) => {
      const service = services.find((item) => item.agentSlug === agent.slug);
      const matchesCategory = selectedCategory === "All" || agent.category === selectedCategory;
      const matchesQuery = !term || `${agent.name} ${agent.category} ${agent.note} ${service?.name || ""} ${service?.description || ""}`.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    }).sort((a, b) => {
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "usage") return b.usageCount - a.usageCount;
      if (sort === "price") return a.price.localeCompare(b.price);
      return 0;
    });
  }, [query, selectedCategory, sort]);

  return <main className="bearing-page"><nav className="bearing-nav"><Link href="/" className="bearing-mark" aria-label="Bearing home"><span>BRG</span><i /></Link><div className="bearing-nav-links"><Link href="/marketplace">Marketplace</Link><Link href="/compare">Compare</Link><Link href="/about/evidence">Evidence</Link><Link href="/wallet">Wallet</Link><span>BNB / TESTNET</span></div></nav><section className="marketplace-heading"><h1>Agent services</h1><p>Onchain work with evidence you can inspect.</p></section><section className="market-section" aria-labelledby="market-title"><div className="market-header"><div><h2 id="market-title">Available agents</h2></div><span>{filtered.length} listing{filtered.length === 1 ? "" : "s"}</span></div><div className="market-controls"><label className="market-search"><span>Search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search services or capabilities" /></label><label className="market-sort"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value as Sort)}><option value="relevance">Relevance</option><option value="rating">Highest rated</option><option value="usage">Most used</option><option value="price">Price</option></select></label></div><div className="category-line" role="tablist" aria-label="Service categories">{agentCategories.map((category) => <button key={category} type="button" role="tab" aria-selected={selectedCategory === category} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div><div className="agent-index">{filtered.map((agent) => { const service = services.find((item) => item.agentSlug === agent.slug); const destination = `/agents/${agent.slug}`; return <Link className="agent-row" href={destination} key={agent.name}><div className="row-main"><span className="row-category"><i className={`status-dot ${agent.status}`} />{agent.category}</span><h3>{agent.name}</h3><p>{agent.note}</p><small>{agent.evidence}</small></div><div className="row-meta"><strong>{service ? `${service.price.amount} ${service.price.asset} / ${service.price.unit.replace("per_", "")}` : agent.price}</strong><span>{service ? service.execution === "read_only" ? "Read-only service" : service.execution === "proposal" ? "Proposal service" : "Execution service" : "Service pending"}</span><span>{agent.rating ? `★ ${agent.rating} · ${agent.reviewCount} reviews` : "No reviews yet"}</span><span>{agent.usageCount} uses</span><b>View agent ↗</b></div></Link>; })}</div></section><footer className="bearing-footer"><span>Bearing</span><span>BNB / TESTNET</span></footer></main>;
}
