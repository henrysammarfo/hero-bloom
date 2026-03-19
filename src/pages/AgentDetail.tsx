import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, ExternalLink, Zap } from "lucide-react";
import { useReadContract } from "wagmi";
import { CIRCUIT_REGISTRY_ADDRESS, circuitRegistryAbi, hasContracts } from "@/lib/contracts";
import { usePoolActivity } from "@/hooks/usePoolActivity";
import { useToast } from "@/hooks/use-toast";
import {
  hasApi,
  getAgentScoreApi,
  drawCreditApi,
  repayCreditApi,
  requestAgentFaucetApi,
  transferAgentToAgentApi,
} from "@/lib/api";

const RISK_TIERS = ["", "A", "B", "C"] as const;
const tierColor = (tier: string) => tier === "A" ? "text-success" : tier === "B" ? "text-warning" : "text-destructive";
const tierBg = (tier: string) => tier === "A" ? "bg-success/10 border-success/20" : tier === "B" ? "bg-warning/10 border-warning/20" : "bg-destructive/10 border-destructive/20";

function shortTx(hash: string) {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

const AgentDetail = () => {
  const { agentId: agentIdParam } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [drawAmount, setDrawAmount] = useState("");
  const [transferToAgentId, setTransferToAgentId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [apiLoading, setApiLoading] = useState<"draw" | "repay" | "score" | "faucet" | "transfer" | null>(null);
  const agentId = agentIdParam?.startsWith("0x") ? (agentIdParam as `0x${string}`) : agentIdParam ? (`0x${agentIdParam}` as `0x${string}`) : undefined;

  const { data: agentData, isLoading } = useReadContract({
    address: CIRCUIT_REGISTRY_ADDRESS,
    abi: circuitRegistryAbi,
    functionName: "getAgent",
    args: agentId ? [agentId] : undefined,
  });

  const { events: poolEvents } = usePoolActivity(50);
  const history = poolEvents.filter((e) => e.agentId.toLowerCase() === agentId?.toLowerCase());

  const [wallet, operator, creditLimit, drawn, riskTierNum, active] = agentData ?? [];
  const riskTier = riskTierNum !== undefined ? RISK_TIERS[riskTierNum] ?? "B" : "B";
  const notFound = !hasContracts || !agentId || (agentData && wallet === "0x0000000000000000000000000000000000000000");

  if (!agentId || (!isLoading && notFound)) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground text-lg">Agent not found.</p>
        <Button variant="heroSecondary" className="mt-6" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (isLoading || !agentData) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground">Loading agent…</p>
      </div>
    );
  }

  const limitNum = creditLimit ? Number(creditLimit) / 1e6 : 0;
  const drawnNum = drawn ? Number(drawn) / 1e6 : 0;
  const utilization = limitNum > 0 ? Math.round((drawnNum / limitNum) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight font-mono break-all">
              {agentId.slice(0, 10)}…{agentId.slice(-8)}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${tierBg(riskTier)} ${tierColor(riskTier)}`}>
              Tier {riskTier}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-success" : "bg-muted-foreground"}`} />
              <span className="capitalize">{active ? "active" : "inactive"}</span>
            </span>
          </div>
          <p className="text-muted-foreground text-xs sm:text-sm font-mono break-all">
            Wallet: {wallet}
          </p>
          <p className="text-muted-foreground text-xs font-mono break-all mt-1">Operator: {operator}</p>
        </div>
        <a
          href={`https://sepolia.etherscan.io/address/${wallet}`}
          target="_blank"
          rel="noopener noreferrer"
          className="liquid-glass rounded-xl px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          View on Etherscan
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
        {[
          { label: "Credit Limit", value: `$${limitNum.toLocaleString()}` },
          { label: "Currently Drawn", value: `$${drawnNum.toLocaleString()}` },
          { label: "Utilisation", value: `${utilization}%` },
          { label: "Status", value: active ? "Active" : "Inactive" },
        ].map((s) => (
          <div key={s.label} className="liquid-glass rounded-2xl p-5 flex flex-col gap-2">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-semibold text-foreground tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {hasApi() && (
        <div className="liquid-glass rounded-2xl p-5 mb-8 sm:mb-10 border border-primary/10">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" /> Backend API (WDK)
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!!apiLoading}
              onClick={async () => {
                setApiLoading("score");
                const { data, error } = await getAgentScoreApi(agentId!);
                setApiLoading(null);
                if (error) toast({ title: "Score failed", description: error, variant: "destructive" });
                else if (data) {
                  const pd = data.probabilityOfDefault != null ? `PD: ${(data.probabilityOfDefault * 100).toFixed(1)}%` : null;
                  const desc = pd ? `${pd}. ${data.reasoning ?? ""}`.trim() : data.reasoning ?? "Scored.";
                  toast({ title: "Credit score", description: desc });
                }
              }}
            >
              {apiLoading === "score" ? "…" : "Fetch score (API)"}
            </Button>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Amount USDT"
                value={drawAmount}
                onChange={(e) => setDrawAmount(e.target.value)}
                className="w-28 bg-secondary/50 border border-border/30 rounded-lg text-sm font-mono px-3 py-2"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={!!apiLoading || !drawAmount || Number(drawAmount) <= 0}
                onClick={async () => {
                  setApiLoading("draw");
                  const { txHash, error } = await drawCreditApi(agentId!, Number(drawAmount));
                  setApiLoading(null);
                  if (error) toast({ title: "Draw failed", description: error, variant: "destructive" });
                  else if (txHash) {
                    toast({ title: "Draw submitted", description: `Tx: ${txHash.slice(0, 10)}…` });
                    setDrawAmount("");
                  }
                }}
              >
                {apiLoading === "draw" ? "…" : "Draw (API)"}
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={!!apiLoading || drawnNum <= 0}
              onClick={async () => {
                setApiLoading("repay");
                const { txHash, error } = await repayCreditApi(agentId!);
                setApiLoading(null);
                if (error) toast({ title: "Repay failed", description: error, variant: "destructive" });
                else if (txHash) toast({ title: "Repay submitted", description: `Tx: ${txHash.slice(0, 10)}…` });
              }}
            >
              {apiLoading === "repay" ? "…" : "Repay (API)"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!!apiLoading}
              onClick={async () => {
                setApiLoading("faucet");
                const { txHash, error } = await requestAgentFaucetApi(agentId!);
                setApiLoading(null);
                if (error) toast({ title: "Faucet failed", description: error, variant: "destructive" });
                else if (txHash) toast({ title: "Faucet submitted", description: `Tx: ${txHash.slice(0, 10)}…` });
              }}
            >
              {apiLoading === "faucet" ? "…" : "Request Faucet (API)"}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 items-center mt-3">
            <input
              type="text"
              placeholder="To Agent ID (0x...)"
              value={transferToAgentId}
              onChange={(e) => setTransferToAgentId(e.target.value)}
              className="w-64 sm:w-80 bg-secondary/50 border border-border/30 rounded-lg text-sm font-mono px-3 py-2"
            />
            <input
              type="number"
              placeholder="USDT"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="w-28 bg-secondary/50 border border-border/30 rounded-lg text-sm font-mono px-3 py-2"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!!apiLoading || !transferToAgentId || !transferAmount || Number(transferAmount) <= 0}
              onClick={async () => {
                setApiLoading("transfer");
                const { txHash, error } = await transferAgentToAgentApi(agentId!, transferToAgentId, Number(transferAmount));
                setApiLoading(null);
                if (error) toast({ title: "Transfer failed", description: error, variant: "destructive" });
                else if (txHash) {
                  toast({ title: "Transfer submitted", description: `Tx: ${txHash.slice(0, 10)}…` });
                  setTransferAmount("");
                }
              }}
            >
              {apiLoading === "transfer" ? "…" : "Transfer to Agent (API)"}
            </Button>
          </div>
        </div>
      )}

      <div className="liquid-glass rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-5 border-b border-border/30">
          <h2 className="text-sm font-semibold text-foreground">Draw / Repay History (on-chain)</h2>
          <span className="text-xs text-muted-foreground font-mono">{history.length} events</span>
        </div>
        <div className="flex-1 divide-y divide-border/10 overflow-y-auto max-h-[480px]">
          {history.length === 0 ? (
            <div className="px-5 py-8 text-center text-muted-foreground text-sm">No draw/repay events for this agent yet.</div>
          ) : (
            history.map((event) => (
              <div key={event.id} className="px-5 py-4 flex items-start gap-3 hover:bg-secondary/10 transition-colors">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${event.type === "draw" ? "bg-warning/10" : "bg-success/10"}`}>
                  {event.type === "draw" ? <ArrowUpRight className="w-3.5 h-3.5 text-warning" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-success" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">
                    <span className="text-muted-foreground capitalize">{event.type}</span>{" "}
                    <span className="font-mono font-medium">${event.amount.toLocaleString()} USDT</span>
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-primary/60 font-mono flex items-center gap-0.5 hover:text-primary transition-colors mt-1.5"
                  >
                    {shortTx(event.transactionHash)}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
