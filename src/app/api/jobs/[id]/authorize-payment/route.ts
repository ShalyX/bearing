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
    const job = result.rows[0] as { state: string; payment_state: string; metadata: { paymentReview?: { status?: string } } };
    if (job.state !== "hire_pending" || job.payment_state !== "pending") { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "invalid_payment_state", state: job.state, paymentState: job.payment_state }, { status: 409 }); }
    if (job.metadata?.paymentReview?.status !== "ready_for_authorization") { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "payment_not_ready", authorization: "not_requested" }, { status: 503 }); }
    await client.query("UPDATE jobs SET metadata=metadata || '{\"paymentAuthorization\":{\"status\":\"requested\"}}'::jsonb, updated_at=NOW() WHERE id=$1", [id]);
    await client.query("INSERT INTO job_events (job_id, event_type, payload) VALUES ($1,'payment_authorization_requested',$2)", [id, JSON.stringify({ authorization: "requested" })]);
    await client.query("COMMIT");
    return NextResponse.redirect(new URL(`/jobs/${id}`, request.url), 303);
  } catch { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "payment_authorization_failed" }, { status: 500 }); } finally { client.release(); }
}
