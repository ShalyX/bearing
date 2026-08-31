import type { Agent } from "@/lib/agents";

export type AgentSource = "fixture" | "erc8004" | "verified_endpoint";

export type AgentVerification = {
  source: AgentSource;
  checkedAt: string | null;
  identityVerified: boolean;
  endpointVerified: boolean;
  invocationVerified: boolean;
  resultVerified: boolean;
  transactionVerified: boolean;
};

export type AgentRecord = Agent & { verification: AgentVerification };

export interface AgentAdapter {
  list(): Promise<AgentRecord[]>;
  get(slug: string): Promise<AgentRecord | undefined>;
}

const previewRecords: AgentRecord[] = [
  {
    slug: "pancake-position-keeper",
    name: "Pancake Position Keeper",
    category: "Rebalancing",
    note: "Keeps a concentrated-liquidity position inside a chosen range.",
    description: "Keeps a concentrated-liquidity position inside a chosen price range.",
    evidence: "Read-only BNB testnet evidence verified",
    permissions: "Position read · bounded rebalance",
    network: "BNB Smart Chain testnet",
    state: "Read-only verified",
    price: "0.0001 tBNB / test",
    status: "online",
    usageCount: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
    verification: {
      source: "verified_endpoint",
      checkedAt: "2026-08-31T00:34:41.679Z",
      identityVerified: true,
      endpointVerified: true,
      invocationVerified: true,
      resultVerified: true,
      transactionVerified: false,
    },
  },
  {
    slug: "range-cartographer",
    identityId: 2047,
    name: "Range Cartographer",
    category: "Grid Trading",
    note: "Builds a bounded, non-executing grid from a live PancakeSwap testnet pool.",
    description: "Reads CAKE/XRP on PancakeSwap V3 testnet and proposes explicit grid levels without submitting an order.",
    evidence: "Live BNB testnet pool endpoint · ERC-8004 #2047",
    permissions: "Pool read · bounded grid proposal · no writes",
    network: "BNB Smart Chain testnet",
    state: "Read-only verified",
    price: "Free during testnet",
    status: "online",
    usageCount: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
    verification: {
      source: "erc8004",
      checkedAt: "2026-08-31T01:40:47.855Z",
      identityVerified: true,
      endpointVerified: true,
      invocationVerified: true,
      resultVerified: true,
      transactionVerified: false,
    },
  },
  {
    slug: "vault-weather",
    identityId: 2048,
    name: "Fee Yield Scout",
    category: "Yield",
    note: "Reads a PancakeSwap LP NFT’s range and accrued-fee conditions.",
    description: "Reads a PancakeSwap V3 testnet position and pool to report range status and accrued fees, without moving capital.",
    evidence: "Live BNB testnet position endpoint · ERC-8004 #2048",
    permissions: "Position read · pool read · no writes",
    network: "BNB Smart Chain testnet",
    state: "Read-only verified",
    price: "Free during testnet",
    status: "online",
    usageCount: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
    verification: {
      source: "erc8004",
      checkedAt: "2026-08-31T01:40:48.341Z",
      identityVerified: true,
      endpointVerified: true,
      invocationVerified: true,
      resultVerified: true,
      transactionVerified: false,
    },
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
    verification: {
      source: "verified_endpoint",
      checkedAt: "2026-08-31T00:34:41.679Z",
      identityVerified: true,
      endpointVerified: true,
      invocationVerified: true,
      resultVerified: true,
      transactionVerified: false,
    },
  },
];

export class PreviewAgentAdapter implements AgentAdapter {
  async list() {
    return previewRecords;
  }

  async get(slug: string) {
    return previewRecords.find((agent) => agent.slug === slug);
  }
}

export const previewAgentAdapter = new PreviewAgentAdapter();
