import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { getService } from "@/lib/services";
import { readPosition, readPositionOwner, verifyBnbRpc } from "@/lib/integration-status";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const limit = checkRateLimit(`invoke:${slug}`);
  if (!limit.allowed) return NextResponse.json({ ok: false, error: "rate_limited", retryAfter: limit.retryAfter }, { status: 429, headers: { "Retry-After": String(limit.retryAfter), "Cache-Control": "no-store" } });
  const isJson = request.headers.get("content-type")?.includes("application/json") ?? false;
  const input = isJson ? await request.json().catch(() => ({})) : { tokenId: (await request.formData()).get("tokenId") };
  const tokenId = String(input.tokenId || input.input?.tokenId || "");
  const service = slug === "pancake-position-keeper" ? getService("pancake-position-read") : undefined;
  if (!service || !/^\d+$/.test(tokenId)) {
    return NextResponse.json({ ok: false, error: "invalid_invocation" }, { status: 400 });
  }

  const [chain, position, owner] = await Promise.all([verifyBnbRpc(), readPosition(tokenId), readPositionOwner(tokenId)]);
  const passed = chain.reason === "rpc_verified" && position.ok && owner.ok;
  const result = passed ? {
    mode: "read_only",
    status: "complete",
    summary: "Position read successfully. No rebalance is needed from this read.",
    chainId: chain.chainId,
    block: chain.latestBlock,
    tokenId,
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
  } : { mode: "read_only", status: "failed", chainReason: chain.reason, positionOk: position.ok, ownerOk: owner.ok };
  const id = randomUUID();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO jobs (id, agent_slug, token_id, state, metadata) VALUES ($1,$2,$3,$4,$5)", [id, slug, tokenId, passed ? "test_completed" : "failed", JSON.stringify({ test: result, service: service.slug, billing: "catalog_only" })]);
    await client.query("INSERT INTO job_events (job_id, event_type, payload) VALUES ($1,$2,$3)", [id, passed ? "test_completed" : "test_failed", JSON.stringify(result)]);
    await client.query("COMMIT");
    if (isJson) return NextResponse.json({ ok: passed, service: service.slug, jobId: id, result, billing: { status: "catalog_only", price: service.price, settlement: "not_connected" } }, { status: passed ? 200 : 502, headers: { "Cache-Control": "no-store" } });
    const target = new URL(`/agents/${slug}?tokenId=${tokenId}&jobId=${id}`, request.url);
    return NextResponse.redirect(target, 303);
  } catch {
    await client.query("ROLLBACK");
    return NextResponse.json({ ok: false, error: "invocation_failed" }, { status: 500 });
  } finally { client.release(); }
}
