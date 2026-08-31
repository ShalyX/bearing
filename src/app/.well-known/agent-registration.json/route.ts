import { NextResponse } from "next/server";

export const dynamic = "force-static";

const identityRegistry = "eip155:97:0x8004A818BFB912233c491871b3d84c89A494BD9e";

export function GET() {
  return NextResponse.json({
    registrations: [
      { agentId: 2047, agentRegistry: identityRegistry },
      { agentId: 2048, agentRegistry: identityRegistry },
    ],
  }, { headers: { "Cache-Control": "public, max-age=300" } });
}
