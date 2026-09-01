import { MarketNav } from "@/components/MarketNav";

export function WorkspaceNav({ section, network = "BNB testnet" }: { section: string; network?: string }) {
  return (
    <>
      <MarketNav />
      <div className="workspace-contextbar" aria-label="Current workspace">
        <span>{section}</span>
        <span>{network}</span>
      </div>
    </>
  );
}
