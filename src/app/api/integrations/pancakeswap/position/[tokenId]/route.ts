import { NextResponse } from "next/server";
import { readPosition, readPositionOwner, readTokenMetadata, verifyBnbRpc } from "@/lib/integration-status";

export const dynamic = "force-dynamic";

function formatUnits(raw: string, decimals: number) {
  const value = BigInt(raw);
  if (decimals === 0) return value.toString();
  const base = BigInt(`1${"0".repeat(decimals)}`);
  const whole = value / base;
  const fraction = value % base;
  return `${whole}.${fraction.toString().padStart(decimals, "0").replace(/0+$/, "") || "0"}`;
}

export async function GET(_: Request, { params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  if (!/^[0-9]+$/.test(tokenId)) return NextResponse.json({ error: "token_id_must_be_decimal" }, { status: 400 });

  const [result, ownerResult, chain] = await Promise.all([readPosition(tokenId), readPositionOwner(tokenId), verifyBnbRpc()]);
  if (!result.ok) return NextResponse.json(result, { status: result.status });
  if (!ownerResult.ok) return NextResponse.json(ownerResult, { status: ownerResult.status });
  const [token0Metadata, token1Metadata] = await Promise.all([readTokenMetadata(result.token0), readTokenMetadata(result.token1)]);
  const metadataVerified = token0Metadata.ok && token1Metadata.ok;
  return NextResponse.json({
    ...result,
    owner: ownerResult.owner,
    token0Metadata,
    token1Metadata,
    metadataVerified,
    tokensOwedHuman: metadataVerified ? {
      token0: formatUnits(result.tokensOwed0, token0Metadata.decimals),
      token1: formatUnits(result.tokensOwed1, token1Metadata.decimals),
    } : null,
    evidence: {
      source: "BNB Smart Chain RPC",
      chainId: chain.chainId,
      block: chain.latestBlock,
      checkedAt: new Date().toISOString(),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
