import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomUUID } from "node:crypto";
import { checkRateLimit } from "@/lib/rate-limit";
import { agents } from "@/lib/agents";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limit = checkRateLimit("jobs:create");
  if (!limit.allowed) return NextResponse.json({ ok: false, error: "rate_limited", retryAfter: limit.retryAfter }, { status: 429, headers: { "Retry-After": String(limit.retryAfter), "Cache-Control": "no-store" } });
  const contentType = request.headers.get("content-type") || "";
  let body: { agentSlug?: string; ownerAddress?: string; tokenId?: string };
  if (contentType.includes("application/json")) body = await request.json().catch(() => ({})) as { agentSlug?: string; ownerAddress?: string; tokenId?: string };
  else { const form = await request.formData(); body = { agentSlug: String(form.get("agentSlug") || ""), ownerAddress: String(form.get("ownerAddress") || ""), tokenId: String(form.get("tokenId") || "") }; }
  if (!body.agentSlug || !agents.some((agent) => agent.slug === body.agentSlug) || (body.ownerAddress && !/^0x[0-9a-fA-F]{40}$/.test(body.ownerAddress)) || (body.tokenId && !/^\d+$/.test(body.tokenId))) return NextResponse.json({ ok: false, error: "invalid_job_request" }, { status: 400 });
  const id = randomUUID();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO jobs (id, agent_slug, owner_address, token_id, state) VALUES ($1,$2,$3,$4,'draft')", [id, body.agentSlug, body.ownerAddress || null, body.tokenId || null]);
    await client.query("INSERT INTO job_events (job_id, event_type, payload) VALUES ($1,'created',$2)", [id, JSON.stringify({ state: "draft" })]);
    await client.query("COMMIT");
    if (!contentType.includes("application/json")) {
      return NextResponse.redirect(new URL(`/jobs/${id}`, request.url), 303);
    }
    return NextResponse.json({ ok: true, job: { id, state: "draft", paymentState: "not_required" } }, { status: 201 });
  } catch { await client.query("ROLLBACK"); return NextResponse.json({ ok: false, error: "job_create_failed" }, { status: 500 }); } finally { client.release(); }
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, error: "job_id_required" }, { status: 400 });
  const result = await db.query("SELECT id, agent_slug, owner_address, token_id, state, payment_state, created_at, updated_at, metadata FROM jobs WHERE id=$1", [id]);
  if (!result.rowCount) return NextResponse.json({ ok: false, error: "job_not_found" }, { status: 404 });
  const events = await db.query("SELECT event_type, payload, created_at FROM job_events WHERE job_id=$1 ORDER BY id", [id]);
  return NextResponse.json({ ok: true, job: result.rows[0], events: events.rows }, { headers: { "Cache-Control": "no-store" } });
}
