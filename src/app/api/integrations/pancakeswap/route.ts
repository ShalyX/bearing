import { NextResponse } from "next/server";
import { verifyBnbRpc } from "@/lib/integration-status";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await verifyBnbRpc(), {
    headers: { "Cache-Control": "no-store" },
  });
}
