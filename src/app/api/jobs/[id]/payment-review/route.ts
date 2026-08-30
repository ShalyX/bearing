import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const amount = process.env.AGENT_HIRE_PRICE_USD?.trim() || "";
  const payTo = process.env.AGENT_HIRE_PAY_TO?.trim() || "0xC2094270dc7d17C1578a975dd1Aa50578c034Be4";
  const currency = process.env.AGENT_HIRE_CURRENCY?.trim() || "tBNB";
  const network = process.env.AGENT_HIRE_NETWORK?.trim() || "BNB Smart Chain Testnet";
  const configured = /^\d+(\.\d{1,6})?$/.test(amount) && /^0x[0-9a-fA-F]{40}$/.test(payTo);
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("SELECT state, payment_state FROM jobs WHERE id=$1 FOR UPDATE", [id]);
    if (!result.rowCount) { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 }); }
    if (result.rows[0].state !== "hire_pending") { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "invalid_state_transition", state: result.rows[0].state }, { status: 409 }); }
    const terms = { status: configured ? "ready_for_authorization" : "unavailable", currency, amount: configured ? amount : null, payTo: configured ? payTo : null, network, authorization: "not_requested", reviewedAt: new Date().toISOString() };
    await client.query("UPDATE jobs SET metadata=metadata || $2::jsonb, updated_at=NOW() WHERE id=$1", [id, JSON.stringify({ paymentReview: terms })]);
    await client.query("INSERT INTO job_events (job_id, event_type, payload) VALUES ($1,$2,$3)", [id, configured ? "payment_review_created" : "payment_review_unavailable", JSON.stringify(terms)]);
    await client.query("COMMIT");
    if (!configured) return NextResponse.json({ ok: false, error: "payment_not_configured", review: terms }, { status: 503 });
    return NextResponse.redirect(new URL(`/jobs/${id}`, request.url), 303);
  } catch { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "payment_review_failed" }, { status: 500 }); } finally { client.release(); }
}
