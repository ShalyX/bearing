export type AgentService = {
  slug: string;
  agentSlug: string;
  name: string;
  description: string;
  category: "Rebalancing" | "Grid Trading" | "Yield" | "Health";
  price: { amount: string; asset: string; unit: "per_read" | "per_use" | "per_month" };
  permissions: string[];
  execution: "read_only" | "proposal" | "execution";
  inputs: { name: string; type: string; required: boolean; description: string }[];
  outputs: { name: string; type: string; description: string }[];
  endpoint: string;
  status: "online" | "pending";
  evidence: { state: "verified" | "pending"; source: string; note: string };
};

export const services: AgentService[] = [
  {
    slug: "pancake-position-read",
    agentSlug: "pancake-position-keeper",
    name: "Read and assess a PancakeSwap position",
    description: "Read a concentrated-liquidity position, compare its current tick with its range, and return a bounded recommendation.",
    category: "Rebalancing",
    price: { amount: "0.0001", asset: "tBNB", unit: "per_read" },
    permissions: ["read_position", "read_pool", "read_owner"],
    execution: "read_only",
    inputs: [{ name: "tokenId", type: "string", required: true, description: "PancakeSwap position NFT token ID" }],
    outputs: [
      { name: "summary", type: "string", description: "Human-readable result" },
      { name: "block", type: "string", description: "BNB block used for the read" },
      { name: "tickLower", type: "number", description: "Lower position boundary" },
      { name: "tickUpper", type: "number", description: "Upper position boundary" },
      { name: "liquidity", type: "string", description: "Raw position liquidity" },
      { name: "evidenceTrace", type: "string", description: "Durable Bearing job ID" },
    ],
    endpoint: "/api/agents/pancake-position-keeper/invoke",
    status: "online",
    evidence: { state: "verified", source: "BNB Smart Chain testnet RPC", note: "Position read, owner, pool, and block evidence verified." },
  },
  {
    slug: "bounded-grid-map",
    agentSlug: "range-cartographer",
    name: "Map a bounded grid around a pair",
    description: "Read the live CAKE/XRP PancakeSwap V3 testnet pool and return explicit grid levels with a bounded order proposal. No order is submitted.",
    category: "Grid Trading",
    price: { amount: "0.002", asset: "tBNB", unit: "per_use" },
    permissions: ["read_pair", "read_price", "propose_grid"],
    execution: "proposal",
    inputs: [
      { name: "pair", type: "string", required: true, description: "Supported testnet pair: CAKE/XRP" },
      { name: "gridLevels", type: "number", required: false, description: "Odd number of proposed levels from 3 to 9" },
    ],
    outputs: [
      { name: "levels", type: "array", description: "Explicit proposed grid levels" },
      { name: "bounds", type: "object", description: "Upper and lower price bounds" },
      { name: "evidenceTrace", type: "string", description: "Durable Bearing job ID when verified" },
    ],
    endpoint: "/api/agents/range-cartographer/invoke",
    status: "online",
    evidence: { state: "verified", source: "PancakeSwap V3 · BNB testnet · ERC-8004 #2047", note: "Live pool state, block, bounded grid proposal, and Bearing evidence job are recorded for every call." },
  },
  {
    slug: "yield-condition-read",
    agentSlug: "vault-weather",
    name: "Read PancakeSwap fee-yield conditions",
    description: "Read a PancakeSwap V3 testnet LP position and report its range status, active pool liquidity, and accrued-fee tokens before a user chooses an action.",
    category: "Yield",
    price: { amount: "0.001", asset: "tBNB", unit: "per_read" },
    permissions: ["read_protocol", "read_pool", "read_yield"],
    execution: "read_only",
    inputs: [{ name: "tokenId", type: "string", required: true, description: "PancakeSwap V3 testnet LP NFT token ID" }],
    outputs: [
      { name: "accruedFees", type: "object", description: "Observed uncollected fee tokens" },
      { name: "conditions", type: "object", description: "Current pool, range, and liquidity conditions" },
      { name: "evidenceTrace", type: "string", description: "Durable Bearing job ID when verified" },
    ],
    endpoint: "/api/agents/vault-weather/invoke",
    status: "online",
    evidence: { state: "verified", source: "PancakeSwap V3 · BNB testnet · ERC-8004 #2048", note: "Live position, pool range, accrued-fee tokens, and Bearing evidence job are recorded for every call." },
  },
  {
    slug: "lending-health-monitor",
    agentSlug: "health-monitor",
    name: "Read Venus lending health",
    description: "Read a Venus position on BNB testnet and return account liquidity, shortfall, balances, checked block, and exact sources.",
    category: "Health",
    price: { amount: "0", asset: "tBNB", unit: "per_read" },
    permissions: ["read_venus_account", "read_venus_market"],
    execution: "read_only",
    inputs: [{ name: "position", type: "address", required: true, description: "A BNB Chain wallet address" }],
    outputs: [
      { name: "accountLiquidity", type: "object", description: "Venus account liquidity tuple" },
      { name: "shortfall", type: "object", description: "Venus shortfall tuple" },
      { name: "checkedBlock", type: "object", description: "Block used for the read" },
      { name: "sources", type: "object", description: "Venus contracts used by the agent" },
      { name: "evidenceTrace", type: "string", description: "Durable Bearing job ID" },
    ],
    endpoint: "https://bearing-fawn.vercel.app/api/agents/health-monitor/run",
    status: "online",
    evidence: { state: "verified", source: "Venus Protocol · BNB testnet · ERC-8004 #2040", note: "Live read, agent response, and durable Bearing job evidence verified." },
  },
];

export function getService(slug: string) { return services.find((service) => service.slug === slug); }
export function getServicesForAgent(agentSlug: string) { return services.filter((service) => service.agentSlug === agentSlug); }
