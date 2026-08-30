"use client";

import { useState } from "react";

declare global { interface Window { ethereum?: { request(args: { method: string; params?: unknown[] }): Promise<unknown> } } }

export default function TestnetPayment({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState("Authorize 0.0001 tBNB in your wallet.");
  const [busy, setBusy] = useState(false);
  async function pay() {
    if (!window.ethereum) { setStatus("No browser wallet detected."); return; }
    setBusy(true);
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as string[];
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x61" }] });
      const txHash = await window.ethereum.request({ method: "eth_sendTransaction", params: [{ from: accounts[0], to: "0xC2094270dc7d17C1578a975dd1Aa50578c034Be4", value: "0x5af3107a4000" }] }) as string;
      setStatus("Transaction sent. Waiting for independent receipt verification…");
      const response = await fetch(`/api/jobs/${jobId}/settle-payment`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ txHash }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "settlement_failed");
      window.location.reload();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Payment was not completed."); setBusy(false); }
  }
  return <div className="workspace-link-form"><button className="workspace-link" type="button" onClick={pay} disabled={busy}>{busy ? "Verifying…" : "Pay 0.0001 tBNB ↗"}</button><small>{status}</small></div>;
}
