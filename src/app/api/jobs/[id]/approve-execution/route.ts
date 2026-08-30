import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT state, payment_state, metadata FROM jobs WHERE id=$1 FOR UPDATE", [id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 }); }
    const job = result.rows[0] as { state: string; payment_state: string; metadata: Record<string, unknown> };
    const execution = job.metadata.execution as { status?: string } | undefined;
    if (job.state !== "hired" || job.payment_state !== "released") { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "payment_settlement_required" }, { status: 409 }); }
    if (execution?.status !== "ready_for_review") { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "execution_review_required" }, { status: 428 }); }
    const approval = { status: "requested", transactionPrepared: false, walletSignature: "not_requested", requestedAt: new Date().toISOString() };
    await client.query("UPDATE jobs SET metadata=metadata || $2::jsonb, updated_at=NOW() WHERE id=$1", [id, JSON.stringify({ executionApproval: approval })]);
    await client.query("INSERT INTO job_events (job_id, event_type, payload) VALUES ($1,'execution_approval_requested',$2)", [id, JSON.stringify(approval)]);
    await client.query("COMMIT");
    return NextResponse.redirect(new URL(`/jobs/${id}`, request.url), 303);
  } catch { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "execution_approval_failed" }, { status: 500 }); } finally { client.release(); }
}
