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
    evidence: "Fixture preview · adapter not yet verified",
    permissions: "Position read · bounded rebalance",
    network: "BNB Smart Chain testnet",
    state: "Fixture preview",
    price: "0.0001 tBNB / test",
    status: "online",
    usageCount: 0,
    rating: 0,
    reviewCount: 0,
    reviews: [],
    verification: {
      source: "fixture",
      checkedAt: null,
      identityVerified: false,
      endpointVerified: false,
      invocationVerified: false,
      resultVerified: false,
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
