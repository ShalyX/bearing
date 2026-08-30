import { NextResponse } from "next/server";
import { services } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ ok: true, services }, { headers: { "Cache-Control": "no-store" } });
}
