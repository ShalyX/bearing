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
    description: "Read a selected pair and return explicit grid levels with a bounded order proposal. No order is submitted.",
    category: "Grid Trading",
    price: { amount: "0.002", asset: "tBNB", unit: "per_use" },
    permissions: ["read_pair", "read_price", "propose_grid"],
    execution: "proposal",
    inputs: [{ name: "pair", type: "string", required: true, description: "Pair symbol such as WBNB/USDT" }],
    outputs: [
      { name: "levels", type: "array", description: "Explicit proposed grid levels" },
      { name: "bounds", type: "object", description: "Upper and lower price bounds" },
      { name: "evidenceTrace", type: "string", description: "Durable Bearing job ID when verified" },
    ],
    endpoint: "/api/services/bounded-grid-map/invoke",
    status: "pending",
    evidence: { state: "pending", source: "Supply intake", note: "Live pair adapter and proposal evidence are not connected yet." },
  },
  {
    slug: "yield-condition-read",
    agentSlug: "vault-weather",
    name: "Read yield conditions before an action",
    description: "Surface protocol yield changes and the underlying pool conditions before a user chooses whether to move capital.",
    category: "Yield",
    price: { amount: "0.001", asset: "tBNB", unit: "per_read" },
    permissions: ["read_protocol", "read_pool", "read_yield"],
    execution: "read_only",
    inputs: [{ name: "protocol", type: "string", required: true, description: "Protocol or vault identifier" }],
    outputs: [
      { name: "apy", type: "number", description: "Observed annualized yield" },
      { name: "conditions", type: "object", description: "Pool and protocol conditions" },
      { name: "evidenceTrace", type: "string", description: "Durable Bearing job ID when verified" },
    ],
    endpoint: "/api/services/yield-condition-read/invoke",
    status: "pending",
    evidence: { state: "pending", source: "Supply intake", note: "Protocol adapter and yield source are not connected yet." },
  },
  {
    slug: "lending-health-read",
    agentSlug: "healthline",
    name: "Read lending health-factor drift",
    description: "Read a lending position and flag health-factor drift with the facts that produced the alert.",
    category: "Health",
    price: { amount: "0.001", asset: "tBNB", unit: "per_read" },
    permissions: ["read_position", "read_market", "read_health_factor"],
    execution: "read_only",
    inputs: [{ name: "position", type: "string", required: true, description: "Lending position identifier" }],
    outputs: [
      { name: "healthFactor", type: "number", description: "Observed health factor" },
      { name: "drift", type: "string", description: "Direction and severity of drift" },
      { name: "evidenceTrace", type: "string", description: "Durable Bearing job ID when verified" },
    ],
    endpoint: "/api/services/lending-health-read/invoke",
    status: "pending",
    evidence: { state: "pending", source: "Supply intake", note: "Lending protocol adapter and position evidence are not connected yet." },
  },
];

export function getService(slug: string) { return services.find((service) => service.slug === slug); }
export function getServicesForAgent(agentSlug: string) { return services.filter((service) => service.agentSlug === agentSlug); }
