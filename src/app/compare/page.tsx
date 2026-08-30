import Link from "next/link";
import { services } from "@/lib/services";

export default function ComparePage() {
  const selected = services;
  const rows: [string, string[]][] = [
    ["Category", selected.map((service) => service.category)],
    ["Status", selected.map((service) => service.status === "online" ? "Online" : "Pending verification")],
    ["Evidence", selected.map((service) => service.evidence.state === "verified" ? "Source verified" : "Not verified")],
    ["Execution", selected.map((service) => service.execution.replace("_", " "))],
    ["Price", selected.map((service) => `${service.price.amount} ${service.price.asset} / ${service.price.unit.replace("per_", "")}`)],
    ["Permissions", selected.map((service) => service.permissions.join(" · "))],
    ["Input", selected.map((service) => service.inputs.map((input) => input.name).join(" · "))],
  ];
  return <main className="workspace-page"><nav className="workspace-nav"><Link href="/" className="workspace-brand">BRG <i /></Link><span>Service comparison</span><span>BNB / TESTNET</span></nav><div className="workspace-body"><Link href="/marketplace" className="workspace-back">← Return to marketplace</Link><header className="workspace-header"><p className="workspace-kicker">Service comparison</p><h1>Compare the<br />work itself.</h1><p className="workspace-lede">Compare scope, price, permissions, and evidence before choosing a service. Pending means the contract is published but its live adapter is not verified.</p></header><section className="compare-table" aria-label="Service comparison"><div className="compare-row compare-head"><span>Field</span>{selected.map((service) => <strong key={service.slug}><Link href={`/agents/${service.agentSlug}#run-service`}>{service.name}</Link></strong>)}</div>{rows.map(([label, values]) => <div className="compare-row" key={label}><span>{label}</span>{values.map((value, index) => <span key={`${label}-${selected[index].slug}`}>{value}</span>)}</div>)}</section><p className="workspace-empty">No usage or rating comparison is shown until Bearing has durable usage and review records for these services.</p></div></main>;
}
