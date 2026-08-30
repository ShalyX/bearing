import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readPoolState } from "@/lib/integration-status";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT state, payment_state, metadata FROM jobs WHERE id=$1 FOR UPDATE", [id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 }); }
    const job = result.rows[0] as { state: string; payment_state: string; metadata: Record<string, unknown> };
    if (job.state !== "hired" || job.payment_state !== "released") { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "payment_settlement_required", state: job.state, paymentState: job.payment_state }, { status: 409 }); }
    const test = job.metadata.test as { token0?: string; token1?: string; fee?: number } | undefined;
    if (!test?.token0 || !test.token1 || typeof test.fee !== "number") { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "test_evidence_incomplete" }, { status: 428 }); }
    const pool = await readPoolState(test.token0, test.token1, test.fee);
    if (!pool.ok) { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: pool.error }, { status: 502 }); }
    const spacing = test.fee === 500 ? 10 : test.fee === 3000 ? 60 : test.fee === 10000 ? 200 : 1;
    const lowerTick = Math.floor((pool.tick - 953) / spacing) * spacing;
    const upperTick = Math.ceil((pool.tick + 953) / spacing) * spacing;
    const execution = { status: "ready_for_review", strategy: "recenter_around_current_price", width: "plus_or_minus_10_percent", tickHalfWidth: 953, currentPriceSource: "live_pool_slot0", pool: pool.pool, currentTick: pool.tick, lowerTick, upperTick, mode: "position_mutation_requires_wallet_approval", prepared: false, reviewedAt: new Date().toISOString() };
    await client.query("UPDATE jobs SET metadata=metadata || $2::jsonb, updated_at=NOW() WHERE id=$1", [id, JSON.stringify({ execution })]);
    await client.query("INSERT INTO job_events (job_id, event_type, payload) VALUES ($1,'execution_review_created',$2)", [id, JSON.stringify(execution)]);
    await client.query("COMMIT");
    return NextResponse.redirect(new URL(`/jobs/${id}`, request.url), 303);
  } catch { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "execution_review_failed" }, { status: 500 }); } finally { client.release(); }
}
