import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  BSC_TESTNET_GRID_REFERENCE,
  formatTokenAmount,
  priceFromSqrtPriceX96,
  readPoolState,
  readPosition,
  readPositionOwner,
  readTokenMetadata,
  verifyBnbRpc,
} from "@/lib/integration-status";
import { checkRateLimit } from "@/lib/rate-limit";
import { getService } from "@/lib/services";

export const dynamic = "force-dynamic";

const serviceByAgent: Record<string, string> = {
  "pancake-position-keeper": "pancake-position-read",
  "range-cartographer": "bounded-grid-map",
  "vault-weather": "yield-condition-read",
};

type InvocationResult = Record<string, unknown> & {
  mode: "read_only" | "proposal";
  status: "complete" | "failed";
  summary: string;
};

async function readInvocationInput(request: Request) {
  const isJson = request.headers.get("content-type")?.includes("application/json") ?? false;
  const raw = isJson
    ? await request.json().catch(() => ({}))
    : Object.fromEntries(await request.formData());
  const input = raw && typeof raw === "object" && "input" in raw && raw.input && typeof raw.input === "object"
    ? { ...raw, ...(raw.input as Record<string, unknown>) }
    : raw as Record<string, unknown>;
  return { input, isJson };
}

function text(input: Record<string, unknown>, key: string) {
  return typeof input[key] === "string" ? input[key].trim() : "";
}

function boundedGridLevelCount(value: string) {
  const count = Number.parseInt(value, 10);
  if (!Number.isInteger(count) || count < 3 || count > 9 || count % 2 === 0) return 5;
  return count;
}

async function runPositionRead(tokenId: string): Promise<{ passed: boolean; result: InvocationResult }> {
  const [chain, position, owner] = await Promise.all([verifyBnbRpc(), readPosition(tokenId), readPositionOwner(tokenId)]);
  const passed = chain.reason === "rpc_verified" && position.ok && owner.ok;
  if (!passed || !position.ok || !owner.ok) {
    return { passed: false, result: { mode: "read_only", status: "failed", summary: "The PancakeSwap position could not be verified from BNB testnet.", chainReason: chain.reason, positionOk: position.ok, ownerOk: owner.ok } };
  }
  return {
    passed: true,
    result: {
      mode: "read_only",
      status: "complete",
      summary: "Position read successfully. No rebalance is submitted from this read.",
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
    },
  };
}

async function runGridProposal(pair: string, gridLevels: string): Promise<{ passed: boolean; result: InvocationResult }> {
  if (pair.replaceAll(" ", "").toUpperCase() !== BSC_TESTNET_GRID_REFERENCE.pair) {
    return { passed: false, result: { mode: "proposal", status: "failed", summary: `Only the verified ${BSC_TESTNET_GRID_REFERENCE.pair} BNB testnet pair is available right now.`, supportedPair: BSC_TESTNET_GRID_REFERENCE.pair } };
  }
  const [chain, pool, token0Metadata, token1Metadata] = await Promise.all([
    verifyBnbRpc(),
    readPoolState(BSC_TESTNET_GRID_REFERENCE.token0, BSC_TESTNET_GRID_REFERENCE.token1, BSC_TESTNET_GRID_REFERENCE.fee),
    readTokenMetadata(BSC_TESTNET_GRID_REFERENCE.token0),
    readTokenMetadata(BSC_TESTNET_GRID_REFERENCE.token1),
  ]);
  const price = pool.ok && token0Metadata.ok && token1Metadata.ok
    ? priceFromSqrtPriceX96(pool.sqrtPriceX96, token0Metadata.decimals, token1Metadata.decimals)
    : null;
  const passed = chain.reason === "rpc_verified" && pool.ok && token0Metadata.ok && token1Metadata.ok && price !== null && price > 0;
  if (!passed || !pool.ok || !token0Metadata.ok || !token1Metadata.ok || price === null) {
    return { passed: false, result: { mode: "proposal", status: "failed", summary: "The CAKE/XRP pool could not be read from BNB testnet.", chainReason: chain.reason, poolOk: pool.ok } };
  }
  const count = boundedGridLevelCount(gridLevels);
  const halfRangeBps = 300;
  const levels = Array.from({ length: count }, (_, index) => {
    const ratio = -1 + (2 * index) / (count - 1);
    return {
      level: index + 1,
      relativeBps: Math.round(ratio * halfRangeBps),
      price: Number((price * (1 + (ratio * halfRangeBps) / 10_000)).toFixed(6)),
    };
  });
  return {
    passed: true,
    result: {
      mode: "proposal",
      status: "complete",
      summary: `Read ${token0Metadata.symbol}/${token1Metadata.symbol} at BNB block ${chain.latestBlock} and proposed ${count} bounded levels. No orders were submitted.`,
      chainId: chain.chainId,
      block: chain.latestBlock,
      pair: `${token0Metadata.symbol}/${token1Metadata.symbol}`,
      pool: pool.pool,
      fee: pool.fee,
      activeLiquidity: pool.liquidity,
      currentTick: pool.tick,
      spotPrice: price,
      bounds: { lower: levels[0]?.price, upper: levels.at(-1)?.price, halfRangeBps },
      levels,
      referencePositionId: BSC_TESTNET_GRID_REFERENCE.referencePositionId,
      checkedAt: new Date().toISOString(),
    },
  };
}

async function runYieldRead(tokenId: string): Promise<{ passed: boolean; result: InvocationResult }> {
  const [chain, position, owner] = await Promise.all([verifyBnbRpc(), readPosition(tokenId), readPositionOwner(tokenId)]);
  if (chain.reason !== "rpc_verified" || !position.ok || !owner.ok) {
    return { passed: false, result: { mode: "read_only", status: "failed", summary: "The PancakeSwap position could not be verified from BNB testnet.", chainReason: chain.reason, positionOk: position.ok, ownerOk: owner.ok } };
  }
  const [pool, token0Metadata, token1Metadata] = await Promise.all([
    readPoolState(position.token0, position.token1, position.fee),
    readTokenMetadata(position.token0),
    readTokenMetadata(position.token1),
  ]);
  if (!pool.ok || !token0Metadata.ok || !token1Metadata.ok) {
    return { passed: false, result: { mode: "read_only", status: "failed", summary: "The LP position was found, but its current pool conditions could not be read.", poolOk: pool.ok } };
  }
  const inRange = pool.tick >= position.tickLower && pool.tick <= position.tickUpper;
  const recommendation = inRange
    ? "Position is currently in range. Continue monitoring fee accrual; no action is submitted."
    : "Position is outside its configured range. Review a separate rebalance proposal; no action is submitted.";
  return {
    passed: true,
    result: {
      mode: "read_only",
      status: "complete",
      summary: `Read ${token0Metadata.symbol}/${token1Metadata.symbol} fee-yield conditions at BNB block ${chain.latestBlock}. ${recommendation}`,
      chainId: chain.chainId,
      block: chain.latestBlock,
      tokenId,
      owner: owner.owner,
      pair: `${token0Metadata.symbol}/${token1Metadata.symbol}`,
      pool: pool.pool,
      fee: pool.fee,
      activeLiquidity: pool.liquidity,
      currentTick: pool.tick,
      range: { lowerTick: position.tickLower, upperTick: position.tickUpper, inRange },
      accruedFees: {
        [token0Metadata.symbol]: { raw: position.tokensOwed0, amount: formatTokenAmount(position.tokensOwed0, token0Metadata.decimals) },
        [token1Metadata.symbol]: { raw: position.tokensOwed1, amount: formatTokenAmount(position.tokensOwed1, token1Metadata.decimals) },
      },
      recommendation,
      checkedAt: new Date().toISOString(),
    },
  };
}

async function persistEvidence(agentSlug: string, tokenReference: string, serviceSlug: string, passed: boolean, result: InvocationResult) {
  const id = randomUUID();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO jobs (id, agent_slug, token_id, state, metadata) VALUES ($1,$2,$3,$4,$5)", [id, agentSlug, tokenReference, passed ? "test_completed" : "failed", JSON.stringify({ test: result, service: serviceSlug, billing: "catalog_only" })]);
    await client.query("INSERT INTO job_events (job_id, event_type, payload) VALUES ($1,$2,$3)", [id, passed ? "test_completed" : "test_failed", JSON.stringify(result)]);
    await client.query("COMMIT");
    return id;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const limit = await checkRateLimit(`invoke:${slug}`);
  if (!limit.allowed) return NextResponse.json({ ok: false, error: "rate_limited", retryAfter: limit.retryAfter }, { status: 429, headers: { "Retry-After": String(limit.retryAfter), "Cache-Control": "no-store" } });
  const service = getService(serviceByAgent[slug] || "");
  if (!service) return NextResponse.json({ ok: false, error: "agent_not_found" }, { status: 404 });

  const { input, isJson } = await readInvocationInput(request);
  const tokenId = text(input, "tokenId");
  const pair = text(input, "pair");
  const gridLevels = text(input, "gridLevels");
  const invocation = slug === "pancake-position-keeper" && /^\d+$/.test(tokenId)
    ? await runPositionRead(tokenId)
    : slug === "range-cartographer" && pair
      ? await runGridProposal(pair, gridLevels)
      : slug === "vault-weather" && /^\d+$/.test(tokenId)
        ? await runYieldRead(tokenId)
        : null;
  if (!invocation) return NextResponse.json({ ok: false, error: "invalid_invocation" }, { status: 400 });

  try {
    const tokenReference = slug === "range-cartographer" ? pair.toUpperCase() : tokenId;
    const jobId = await persistEvidence(slug, tokenReference, service.slug, invocation.passed, invocation.result);
    if (isJson) return NextResponse.json({ ok: invocation.passed, service: service.slug, jobId, result: invocation.result, billing: { status: "catalog_only", price: service.price, settlement: "not_connected" } }, { status: invocation.passed ? 200 : 502, headers: { "Cache-Control": "no-store" } });

    const search = new URLSearchParams({ jobId });
    if (slug === "range-cartographer") {
      search.set("pair", pair.toUpperCase());
      search.set("gridLevels", String(boundedGridLevelCount(gridLevels)));
    } else {
      search.set("tokenId", tokenId);
    }
    return NextResponse.redirect(new URL(`/agents/${slug}?${search.toString()}`, request.url), 303);
  } catch {
    return NextResponse.json({ ok: false, error: "invocation_failed" }, { status: 500 });
  }
}
