import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readPosition, readPositionOwner, verifyBnbRpc } from "@/lib/integration-status";
import { jobMutationError } from "@/lib/job-capability";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jobResult = await db.query("SELECT agent_slug, owner_address, token_id, state, capability_hash, capability_expires_at FROM jobs WHERE id=$1", [id]);
  if (!jobResult.rowCount) return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 });
  const job = jobResult.rows[0] as { agent_slug: string; owner_address: string | null; token_id: string | null; state: string; capability_hash: string | null; capability_expires_at: string | Date | null };
  const guard = jobMutationError(request, id, job);
  if (guard) return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status });
  if (job.agent_slug !== "pancake-position-keeper") return NextResponse.json({ ok: false, error: "agent_test_not_supported" }, { status: 409 });
  if (job.state !== "test_requested") return NextResponse.json({ ok: false, error: "invalid_state_transition", state: job.state }, { status: 409 });
  if (!job.token_id) return NextResponse.json({ ok: false, error: "token_id_required" }, { status: 422 });

  const [chain, position, owner] = await Promise.all([verifyBnbRpc(), readPosition(job.token_id), readPositionOwner(job.token_id)]);
  const ownerMatches = !job.owner_address || (owner.ok && owner.owner.toLowerCase() === job.owner_address.toLowerCase());
  const passed = chain.reason === "rpc_verified" && position.ok && owner.ok && ownerMatches;
  const resultPayload = passed ? {
    mode: "read_only",
    chainId: chain.chainId,
    block: chain.latestBlock,
    token0: position.token0,
    token1: position.token1,
    fee: position.fee,
    owner: owner.owner,
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    liquidity: position.liquidity,
    tokensOwed0: position.tokensOwed0,
    tokensOwed1: position.tokensOwed1,
    checkedAt: new Date().toISOString(),
  } : { mode: "read_only", chainReason: chain.reason, positionOk: position.ok, ownerOk: owner.ok, ownerMatches };

  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const locked = await client.query("SELECT state FROM jobs WHERE id=$1 FOR UPDATE", [id]);
    if (!locked.rowCount) { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 }); }
    if (locked.rows[0].state !== "test_requested") { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "invalid_state_transition", state: locked.rows[0].state }, { status: 409 }); }
    const nextState = passed ? "test_completed" : "failed";
    await client.query("UPDATE jobs SET state=$2, metadata=metadata || $3::jsonb, updated_at=NOW() WHERE id=$1", [id, nextState, JSON.stringify({ test: resultPayload })]);
    await client.query("INSERT INTO job_events (job_id, event_type, payload) VALUES ($1,$2,$3)", [id, passed ? "test_completed" : "test_failed", JSON.stringify(resultPayload)]);
    await client.query("COMMIT");
    return NextResponse.json({ ok: passed, state: nextState, result: resultPayload }, { status: passed ? 200 : 502 });
  } catch { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "test_execution_failed" }, { status: 500 }); } finally { client.release(); }
}
