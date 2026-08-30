import { NextResponse } from "next/server";
import { getService } from "@/lib/services";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return NextResponse.json({ ok: false, error: "service_not_found" }, { status: 404 });
  const body = await request.json().catch(() => ({})) as { input?: Record<string, unknown> };
  const tokenId = String(body.input?.tokenId || "");
  if (!/^\d+$/.test(tokenId)) return NextResponse.json({ ok: false, error: "input_required", field: "tokenId" }, { status: 400 });
  return NextResponse.json({
    ok: true,
    service: service.slug,
    quote: {
      price: service.price,
      input: { tokenId },
      permissions: service.permissions,
      execution: service.execution,
      authorization: "required_before_payment",
      payment: "not_connected",
      expiresInSeconds: 300,
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
