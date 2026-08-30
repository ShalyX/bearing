import { NextResponse } from "next/server";
import { readOwnedTokenIds } from "@/lib/integration-status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const owner = new URL(request.url).searchParams.get("owner") || "";
  const result = await readOwnedTokenIds(owner);
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
