import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobMutationError } from "@/lib/job-capability";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT state, capability_hash, capability_expires_at FROM jobs WHERE id=$1 FOR UPDATE", [id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 }); }
    const guard = jobMutationError(request, id, result.rows[0]);
    if (guard) { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: guard.error }, { status: guard.status }); }
    if (result.rows[0].state !== "draft") { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "invalid_state_transition", state: result.rows[0].state }, { status: 409 }); }
    await client.query("UPDATE jobs SET state='test_requested', updated_at=NOW() WHERE id=$1", [id]);
    await client.query("INSERT INTO job_events (job_id, event_type, payload) VALUES ($1,'test_requested',$2)", [id, JSON.stringify({ state: "test_requested", mode: "read_only" })]);
    await client.query("COMMIT");
    return NextResponse.redirect(new URL(`/jobs/${id}`, request.url), 303);
  } catch { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "test_request_failed" }, { status: 500 }); } finally { client.release(); }
}
