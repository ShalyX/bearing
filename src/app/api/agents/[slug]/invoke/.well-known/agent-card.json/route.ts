import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const cardBySlug: Record<string, { name: string; description: string; skill: { id: string; name: string; description: string } }> = {
  "range-cartographer": {
    name: "Range Cartographer",
    description: "Read-only CAKE/XRP PancakeSwap V3 grid proposal agent for Bearing.",
    skill: { id: "bounded-grid-map", name: "Map a bounded grid", description: "Read the live BNB testnet pool and return explicit grid levels without submitting orders." },
  },
  "vault-weather": {
    name: "Fee Yield Scout",
    description: "Read-only PancakeSwap V3 LP fee-yield conditions agent for Bearing.",
    skill: { id: "yield-condition-read", name: "Read fee-yield conditions", description: "Read an LP position and its pool to report range status and accrued fees without moving capital." },
  },
};

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = cardBySlug[slug];
  if (!card) return NextResponse.json({ ok: false, error: "agent_not_found" }, { status: 404 });
  const invokeUrl = new URL(`/api/agents/${slug}/invoke`, request.url).toString();
  return NextResponse.json({
    name: card.name,
    description: card.description,
    url: invokeUrl,
    version: "0.1.0",
    protocolVersion: "0.3.0",
    capabilities: { streaming: false, pushNotifications: false, stateTransitionHistory: false },
    defaultInputModes: ["application/json", "application/x-www-form-urlencoded"],
    defaultOutputModes: ["application/json"],
    skills: [card.skill],
  }, { headers: { "Cache-Control": "public, max-age=300" } });
}
