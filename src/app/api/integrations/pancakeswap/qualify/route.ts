import { NextResponse } from "next/server";
import { readPosition, readPositionOwner, verifyBnbRpc } from "@/lib/integration-status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner")?.trim() || "";
  const tokenId = searchParams.get("tokenId")?.trim() || "";
  if (!/^0x[0-9a-fA-F]{40}$/.test(owner) || !/^\d+$/.test(tokenId)) return NextResponse.json({ ok: false, error: "owner_and_token_id_required" }, { status: 400 });
  const [chain, position, positionOwner] = await Promise.all([verifyBnbRpc(), readPosition(tokenId), readPositionOwner(tokenId)]);
  const ownerMatches = positionOwner.ok && positionOwner.owner.toLowerCase() === owner.toLowerCase();
  const qualified = chain.reason === "rpc_verified" && position.ok && positionOwner.ok && ownerMatches;
  return NextResponse.json({ ok: true, qualified, checkedAtBlock: chain.latestBlock, chainId: chain.chainId, owner, tokenId, evidence: { chain: chain.reason, position: position.ok ? "read" : position.error, positionOwner: positionOwner.ok ? "read" : positionOwner.error, ownerMatches }, note: qualified ? "Read-only qualification passed. No execution or transaction was performed." : "Read-only qualification did not pass. No execution or transaction was performed." });
}
