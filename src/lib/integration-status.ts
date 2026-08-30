const DEFAULT_BNB_RPC_URL = "https://bsc-dataseed.binance.org";
export const PANCAKE_V3_POSITION_MANAGER_BSC = "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364";
export const PANCAKE_V3_FACTORY_BSC = "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865";

type RpcCall = { jsonrpc: "2.0"; id: number; method: string; params: unknown[] };

export type PancakeIntegrationStatus = {
  provider: "pancakeswap";
  configured: boolean;
  source: "official_bnb_rpc" | "not_configured";
  liveDataEnabled: boolean;
  reason: "rpc_verified" | "rpc_unverified" | "endpoint_missing";
  chainId: string | null;
  latestBlock: string | null;
  positionManager: string;
  positionManagerCodePresent: boolean;
};

export function getBnbRpcUrl() {
  return process.env["BNB_RPC_URL"]?.trim() || DEFAULT_BNB_RPC_URL;
}

function baseStatus(): PancakeIntegrationStatus {
  return {
    provider: "pancakeswap",
    configured: true,
    source: "official_bnb_rpc",
    liveDataEnabled: false,
    reason: "rpc_unverified",
    chainId: null,
    latestBlock: null,
    positionManager: PANCAKE_V3_POSITION_MANAGER_BSC,
    positionManagerCodePresent: false,
  };
}

export function getPancakeIntegrationStatus() {
  return baseStatus();
}

async function fetchRpc(body: RpcCall, attempts = 2) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.BNB_RPC_TIMEOUT_MS || 8000));
    try {
      const response = await fetch(getBnbRpcUrl(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store", signal: controller.signal });
      if (response.ok) return response;
      lastError = new Error("rpc_http_failure");
    } catch (error) { lastError = error; }
    finally { clearTimeout(timeout); }
    if (attempt + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, 150 * (attempt + 1)));
  }
  throw lastError instanceof Error ? lastError : new Error("rpc_request_failed");
}

export async function verifyBnbRpc(): Promise<PancakeIntegrationStatus> {
  const calls: RpcCall[] = [
    { jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] },
    { jsonrpc: "2.0", id: 2, method: "eth_blockNumber", params: [] },
    { jsonrpc: "2.0", id: 3, method: "eth_getCode", params: [PANCAKE_V3_POSITION_MANAGER_BSC, "latest"] },
  ];

  try {
    const payloads = await Promise.all(calls.map(async (body) => {
      const response = await fetchRpc(body);
      if (!response.ok) throw new Error("rpc_http_failure");
      return response.json() as Promise<{ result?: string; error?: unknown }>;
    }));
    const chainId = payloads[0]?.result;
    const latestBlock = payloads[1]?.result;
    const code = payloads[2]?.result;
    if (chainId !== "0x38" || typeof latestBlock !== "string" || typeof code !== "string" || code.length <= 2) throw new Error("rpc_verification_failed");
    return { ...baseStatus(), reason: "rpc_verified", chainId, latestBlock, positionManagerCodePresent: true };
  } catch {
    return baseStatus();
  }
}

export async function readPositionOwner(tokenId: string) {
  try {
    const numericId = BigInt(tokenId);
    if (numericId < BigInt(0)) return { ok: false as const, status: 400, error: "token_id_must_be_non_negative" };
    const data = `0x6352211e${numericId.toString(16).padStart(64, "0")}`;
    const response = await fetchRpc({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: PANCAKE_V3_POSITION_MANAGER_BSC, data }, "latest"] });
    if (!response.ok) return { ok: false as const, status: 502, error: "rpc_http_failure" };
    const payload = await response.json() as { result?: string; error?: unknown };
    if (payload.error || typeof payload.result !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(payload.result)) return { ok: false as const, status: 404, error: "position_not_found" };
    return { ok: true as const, contract: PANCAKE_V3_POSITION_MANAGER_BSC, tokenId, owner: `0x${payload.result.slice(-40)}` };
  } catch {
    return { ok: false as const, status: 502, error: "owner_read_failed" };
  }
}

export async function readOwnedTokenIds(owner: string, limit = 20) {
  try {
    if (!/^0x[0-9a-fA-F]{40}$/.test(owner)) return { ok: false as const, status: 400, error: "invalid_owner_address" };
    const call = async (data: string) => {
      const response = await fetchRpc({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: PANCAKE_V3_POSITION_MANAGER_BSC, data }, "latest"] });
      if (!response.ok) throw new Error("rpc_http_failure");
      return response.json() as Promise<{ result?: string; error?: unknown }>;
    };
    const balancePayload = await call(`0x70a08231${owner.slice(2).toLowerCase().padStart(64, "0")}`);
    if (balancePayload.error || typeof balancePayload.result !== "string") return { ok: false as const, status: 502, error: "balance_read_failed" };
    const balance = BigInt(`0x${balancePayload.result.slice(-64)}`);
    const count = Number(balance > BigInt(limit) ? BigInt(limit) : balance);
    const ids = await Promise.all(Array.from({ length: count }, (_, index) => call(`0x2f745c59${owner.slice(2).toLowerCase().padStart(64, "0")}${index.toString(16).padStart(64, "0")}`)));
    const tokenIds = ids.flatMap((payload) => payload.result && /^0x[0-9a-fA-F]{64}$/.test(payload.result) ? [BigInt(`0x${payload.result.slice(-64)}`).toString()] : []);
    return { ok: true as const, owner, balance: balance.toString(), tokenIds, truncated: balance > BigInt(limit) };
  } catch {
    return { ok: false as const, status: 502, error: "owned_positions_read_failed" };
  }
}

export async function readTokenMetadata(address: string) {
  try {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return { ok: false as const, error: "invalid_token_address" };
    const calls: RpcCall[] = [
      { jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: address, data: "0x95d89b41" }, "latest"] },
      { jsonrpc: "2.0", id: 2, method: "eth_call", params: [{ to: address, data: "0x313ce567" }, "latest"] },
    ];
    const responses = await Promise.all(calls.map((body) => fetchRpc(body)));
    if (responses.some((response) => !response.ok)) return { ok: false as const, error: "rpc_http_failure" };
    const payloads = await Promise.all(responses.map((response) => response.json() as Promise<{ result?: string; error?: unknown }>));
    const symbolRaw = payloads[0]?.result;
    const decimalsRaw = payloads[1]?.result;
    if (payloads.some((payload) => payload.error) || typeof symbolRaw !== "string" || typeof decimalsRaw !== "string") return { ok: false as const, error: "token_metadata_unavailable" };
    const symbolHex = symbolRaw.slice(2);
    const symbolLength = symbolHex.length >= 128 ? Number.parseInt(symbolHex.slice(64, 128), 16) : 0;
    const symbolData = symbolLength > 0 && symbolHex.length >= 128 + symbolLength * 2 ? symbolHex.slice(128, 128 + symbolLength * 2) : symbolHex.slice(0, 64);
    const symbol = Buffer.from(symbolData, "hex").toString("utf8").replace(/\0/g, "").trim();
    const decimals = Number.parseInt(decimalsRaw.slice(-2), 16);
    if (!symbol || !Number.isInteger(decimals) || decimals < 0 || decimals > 36) return { ok: false as const, error: "token_metadata_invalid" };
    return { ok: true as const, address, symbol, decimals };
  } catch {
    return { ok: false as const, error: "token_metadata_read_failed" };
  }
}

export async function readPosition(tokenId: string) {
  try {
    const numericId = BigInt(tokenId);
    if (numericId < BigInt(0)) return { ok: false as const, status: 400, error: "token_id_must_be_non_negative" };
    const data = `0x99fbab88${numericId.toString(16).padStart(64, "0")}`;
    const response = await fetchRpc({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: PANCAKE_V3_POSITION_MANAGER_BSC, data }, "latest"] });
    if (!response.ok) return { ok: false as const, status: 502, error: "rpc_http_failure" };
    const payload = await response.json() as { result?: string; error?: unknown };
    if (payload.error || typeof payload.result !== "string" || !/^0x[0-9a-fA-F]+$/.test(payload.result) || (payload.result.length - 2) < 32 * 12) return { ok: false as const, status: 404, error: "position_not_found" };
    const words = Array.from({ length: 12 }, (_, index) => payload.result!.slice(2 + index * 64, 2 + (index + 1) * 64));
    const signed24 = (word: string) => { const value = Number.parseInt(word.slice(-6), 16); return value >= 0x800000 ? value - 0x1000000 : value; };
    return { ok: true as const, contract: PANCAKE_V3_POSITION_MANAGER_BSC, tokenId, operator: `0x${words[1].slice(-40)}`, token0: `0x${words[2].slice(-40)}`, token1: `0x${words[3].slice(-40)}`, fee: Number.parseInt(words[4].slice(-6), 16), tickLower: signed24(words[5]), tickUpper: signed24(words[6]), liquidity: BigInt(`0x${words[7]}`).toString(), tokensOwed0: BigInt(`0x${words[10]}`).toString(), tokensOwed1: BigInt(`0x${words[11]}`).toString() };
  } catch {
    return { ok: false as const, status: 502, error: "position_read_failed" };
  }
}

export async function readPoolState(token0: string, token1: string, fee: number) {
  try {
    const [first, second] = [token0.toLowerCase(), token1.toLowerCase()].sort();
    const addressWord = (address: string) => address.slice(2).padStart(64, "0");
    const poolCall = `0x1698ee82${addressWord(first)}${addressWord(second)}${fee.toString(16).padStart(64, "0")}`;
    const poolResponse = await fetchRpc({ jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: PANCAKE_V3_FACTORY_BSC, data: poolCall }, "latest"] });
    const poolPayload = await poolResponse.json() as { result?: string };
    if (typeof poolPayload.result !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(poolPayload.result) || /^0x0+$/.test(poolPayload.result)) return { ok: false as const, error: "pool_not_found" };
    const pool = `0x${poolPayload.result.slice(-40)}`;
    const slotResponse = await fetchRpc({ jsonrpc: "2.0", id: 2, method: "eth_call", params: [{ to: pool, data: "0x3850c7bd" }, "latest"] });
    const slotPayload = await slotResponse.json() as { result?: string };
    if (typeof slotPayload.result !== "string" || slotPayload.result.length < 130) return { ok: false as const, error: "slot0_unavailable" };
    const sqrtPriceX96 = `0x${slotPayload.result.slice(2, 66)}`;
    const rawTick = Number.parseInt(slotPayload.result.slice(122, 130), 16);
    return { ok: true as const, factory: PANCAKE_V3_FACTORY_BSC, pool, token0: first, token1: second, fee, sqrtPriceX96, tick: rawTick >= 0x80000000 ? rawTick - 0x100000000 : rawTick };
  } catch { return { ok: false as const, error: "pool_state_read_failed" }; }
}
