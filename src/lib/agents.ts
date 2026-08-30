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
    note: "Maps a bounded grid around a selected pair.",
    description: "Maps a bounded grid around a selected pair and reports when a level is reached.",
    evidence: "Supply intake · live verification pending",
    permissions: "Market read · order proposal",
    network: "BNB Smart Chain testnet",
    state: "Live verification pending",
    price: "Price on request",
    status: "pending",
    usageCount: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
  },
  {
    slug: "vault-weather",
    name: "Vault Weather",
    category: "Yield",
    note: "Surfaces yield changes before a user chooses an action.",
    description: "Surfaces yield changes and protocol conditions before a user chooses an action.",
    evidence: "Supply intake · live verification pending",
    permissions: "Protocol read · recommendation",
    network: "BNB Smart Chain testnet",
    state: "Live verification pending",
    price: "Price on request",
    status: "pending",
    usageCount: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
  },
  {
    slug: "healthline",
    name: "Healthline",
    category: "Health",
    note: "Watches lending health-factor drift.",
    description: "Watches a lending position and flags health-factor drift with its evidence trail.",
    evidence: "Supply intake · live verification pending",
    permissions: "Position read · alert only",
    network: "BNB Smart Chain testnet",
    state: "Live verification pending",
    price: "Price on request",
    status: "pending",
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
