import { NextResponse } from "next/server";
import { readPoolState } from "@/lib/integration-status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const token0 = query.get("token0") || "";
  const token1 = query.get("token1") || "";
  const fee = Number(query.get("fee"));
  if (!/^0x[0-9a-fA-F]{40}$/.test(token0) || !/^0x[0-9a-fA-F]{40}$/.test(token1) || !Number.isInteger(fee) || fee < 0 || fee > 1000000) return NextResponse.json({ ok: false, error: "invalid_pool_request" }, { status: 400 });
  const result = await readPoolState(token0, token1, fee);
  return NextResponse.json(result, { status: result.ok ? 200 : 502, headers: { "Cache-Control": "no-store" } });
}
