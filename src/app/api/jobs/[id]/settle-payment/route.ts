import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getBnbRpcUrl } from "@/lib/integration-status";
import { checkRateLimit } from "@/lib/rate-limit";
import { jobMutationError } from "@/lib/job-capability";

export const dynamic = "force-dynamic";
const RECIPIENT = "0xC2094270dc7d17C1578a975dd1Aa50578c034Be4";
const VALUE_WEI = "100000000000000";

async function rpc(method: string, params: unknown[]) {
  const response = await fetch(getBnbRpcUrl(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), cache: "no-store", signal: AbortSignal.timeout(8_000) });
  if (!response.ok) throw new Error("rpc_http_failure");
  return response.json() as Promise<{ result?: unknown; error?: unknown }>;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const limit = await checkRateLimit("payment:settle", 5);
  if (!limit.allowed) return NextResponse.json({ ok: false, error: "rate_limited", retryAfter: limit.retryAfter }, { status: 429, headers: { "Retry-After": String(limit.retryAfter), "Cache-Control": "no-store" } });
  const body = await request.json().catch(() => ({})) as { txHash?: string };
  if (!body.txHash || !/^0x[0-9a-fA-F]{64}$/.test(body.txHash)) return NextResponse.json({ ok: false, error: "tx_hash_required" }, { status: 400 });
  const jobResult = await db.query("SELECT state, payment_state, owner_address, metadata, capability_hash, capability_expires_at FROM jobs WHERE id=$1", [id]);
  if (!jobResult.rowCount) return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 });
  const job = jobResult.rows[0] as { state: string; payment_state: string; owner_address: string | null; metadata: Record<string, unknown>; capability_hash: string | null; capability_expires_at: string | Date | null };
  const guard = jobMutationError(request, id, job);
  if (guard) return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });
  const authorization = job.metadata.paymentAuthorization as { status?: string } | undefined;
  const review = job.metadata.paymentReview as { status?: string; amount?: string; currency?: string; network?: string; payTo?: string } | undefined;
  if (job.state !== "hire_pending" || job.payment_state !== "pending") return NextResponse.json({ ok: false, error: "invalid_payment_state", state: job.state, paymentState: job.payment_state }, { status: 409 });
  if (authorization?.status !== "requested") return NextResponse.json({ ok: false, error: "payment_authorization_required" }, { status: 428 });
  if (review?.status !== "ready_for_authorization" || review.amount !== "0.0001" || review.currency !== "tBNB" || review.network !== "BNB Smart Chain Testnet" || review.payTo?.toLowerCase() !== RECIPIENT.toLowerCase()) return NextResponse.json({ ok: false, error: "payment_terms_mismatch", settlement: "not_started" }, { status: 409 });
  try {
    const [txResponse, receiptResponse, chainResponse] = await Promise.all([rpc("eth_getTransactionByHash", [body.txHash]), rpc("eth_getTransactionReceipt", [body.txHash]), rpc("eth_chainId", [])]);
    const tx = txResponse.result as { from?: string; to?: string; value?: string } | undefined; const receipt = receiptResponse.result as { status?: string; blockNumber?: string } | undefined;
    const senderMatches = !!job.owner_address && typeof tx?.from === "string" && tx.from.toLowerCase() === job.owner_address.toLowerCase();
    const valid = chainResponse.result === "0x61" && !!tx && !!receipt && receipt.status === "0x1" && senderMatches && typeof tx.to === "string" && tx.to.toLowerCase() === RECIPIENT.toLowerCase() && typeof tx.value === "string" && BigInt(tx.value) === BigInt(VALUE_WEI);
    if (!valid) return NextResponse.json({ ok: false, error: "payment_receipt_not_verified", settlement: "not_started" }, { status: 402 });
    const client = await db.connect();
    try {
      await client.query("BEGIN");
      const locked = await client.query("SELECT state, payment_state FROM jobs WHERE id=$1 FOR UPDATE", [id]);
      if (!locked.rowCount || locked.rows[0].state !== "hire_pending" || locked.rows[0].payment_state !== "pending") { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "payment_already_processed" }, { status: 409 }); }
      const evidence = { txHash: body.txHash.toLowerCase(), network: "BNB Smart Chain Testnet", asset: "native tBNB", amount: "0.0001", recipient: RECIPIENT, block: receipt.blockNumber, verifiedAt: new Date().toISOString() };
      const settlement = await client.query("INSERT INTO payment_settlements (tx_hash, network, job_id, evidence) VALUES ($1,$2,$3,$4) ON CONFLICT (tx_hash) DO NOTHING RETURNING tx_hash", [evidence.txHash, evidence.network, id, JSON.stringify(evidence)]);
      if (!settlement.rowCount) { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "payment_already_used", settlement: "rejected" }, { status: 409 }); }
      await client.query("UPDATE jobs SET state='hired', payment_state='held', metadata=metadata || $2::jsonb, updated_at=NOW() WHERE id=$1", [id, JSON.stringify({ payment: evidence })]);
      await client.query("INSERT INTO job_events (job_id, event_type, payload) VALUES ($1,'payment_settled',$2)", [id, JSON.stringify(evidence)]);
      await client.query("COMMIT");
      return NextResponse.json({ ok: true, state: "hired", paymentState: "held", settlement: "verified_and_held", evidence });
    } catch { await client.query("ROLLBACK"); throw new Error("payment_persist_failed"); } finally { client.release(); }
  } catch { return NextResponse.json({ ok: false, error: "payment_verification_failed", settlement: "not_started" }, { status: 502 }); }
}
