export type AgentCategory = "Rebalancing" | "Grid Trading" | "Yield" | "Health";

export type AgentEvidenceState = "Read-only verified" | "Fixture preview" | "Live verification pending";

export type Agent = {
  slug: string;
  name: string;
  category: AgentCategory;
  note: string;
  description: string;
  evidence: string;
  permissions: string;
  network: string;
  state: AgentEvidenceState;
  price: string;
  status: "online" | "pending";
  usageCount: number;
  rating: number;
  reviewCount: number;
  reviews: { rating: number; text: string; date: string }[];
};

export const agentCategories = ["All", "Rebalancing", "Grid Trading", "Yield", "Health"] as const;

export const agents: Agent[] = [
  {
    slug: "pancake-position-keeper",
    name: "Pancake Position Keeper",
    category: "Rebalancing",
    note: "Keeps a concentrated-liquidity position inside a chosen range.",
    description: "Keeps a concentrated-liquidity position inside a chosen price range.",
    evidence: "Read-only BNB evidence verified",
    permissions: "Position read · bounded rebalance",
    network: "BNB Smart Chain testnet",
    state: "Read-only verified",
    price: "0.0001 tBNB / test",
    status: "online",
    usageCount: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
  },
  {
    slug: "range-cartographer",
    name: "Range Cartographer",
    category: "Grid Trading",
    note: "Builds a bounded, non-executing grid from a live PancakeSwap testnet pool.",
    description: "Reads the CAKE/XRP PancakeSwap V3 testnet pool and returns explicit grid levels. It never submits an order.",
    evidence: "Live BNB testnet pool read · identity registration pending",
    permissions: "Pool read · bounded grid proposal · no writes",
    network: "BNB Smart Chain testnet",
    state: "Read-only verified",
    price: "Free during testnet",
    status: "online",
    usageCount: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
  },
  {
    slug: "vault-weather",
    name: "Fee Yield Scout",
    category: "Yield",
    note: "Reads a PancakeSwap LP NFT’s range and accrued-fee conditions.",
    description: "Reads a PancakeSwap V3 testnet position and its pool to report in-range status and accrued fees. It does not move capital.",
    evidence: "Live BNB testnet position read · identity registration pending",
    permissions: "Position read · pool read · no writes",
    network: "BNB Smart Chain testnet",
    state: "Read-only verified",
    price: "Free during testnet",
    status: "online",
    usageCount: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
  },
  {
    slug: "health-monitor",
    name: "Health Monitor",
    category: "Health",
    note: "Reads Venus lending health and returns a source-linked, read-only report.",
    description: "A deployed BNB Agent Studio seller agent for Venus lending health analysis. It never repays, liquidates, borrows, or moves funds.",
    evidence: "BNB Agent Studio live runtime · ERC-8004 #2040",
    permissions: "Venus account read · market read · no writes",
    network: "BNB Smart Chain testnet",
    state: "Read-only verified",
    price: "Free during trial",
    status: "online",
    usageCount: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
  },
];

export function getAgent(slug: string) {
  return agents.find((agent) => agent.slug === slug);
}

export function getAgentsByCategory(category: AgentCategory) {
  return agents.filter((agent) => agent.category === category);
}
