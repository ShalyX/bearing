import { NextResponse } from "next/server";
import { getService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return NextResponse.json({ ok: false, error: "service_not_found" }, { status: 404 });
  return NextResponse.json({ ok: true, service }, { headers: { "Cache-Control": "no-store" } });
}
