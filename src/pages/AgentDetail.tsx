import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Brain,
  TrendingUp,
  Users,
  Clock,
  ShieldCheck,
} from "lucide-react";

// ─── Mock data ───────────────────────────────────────────────────────────────

type RiskTier = "A" | "B" | "C";

interface AgentData {
  id: string;
  name: string;
  type: string;
  creditLimit: number;
  drawn: number;
  riskTier: RiskTier;
  completionRate: number;
  repaymentRate: number;
  status: "active" | "idle" | "flagged";
  walletAddress: string;
  registeredDate: string;
  totalTasksCompleted: number;
  totalRevenue: number;
  creditScore: {
    taskCompletion: number;
    revenueConsistency: number;
    clientDiversity: number;
    historyLength: number;
    operatorReputation: number;
  };
}

interface HistoryEvent {
  id: string;
  type: "draw" | "repay";
  amount: number;
  timestamp: string;
  txHash: string;
  blockNumber: number;
}

const agentsMap: Record<string, AgentData> = {
  "AGT-001": { id: "AGT-001", name: "ResearchBot Alpha", type: "Research", creditLimit: 500, drawn: 120, riskTier: "A", completionRate: 98, repaymentRate: 100, status: "active", walletAddress: "0x7a3f…e21c4B8d", registeredDate: "2026-01-15", totalTasksCompleted: 342, totalRevenue: 8540, creditScore: { taskCompletion: 95, revenueConsistency: 88, clientDiversity: 72, historyLength: 90, operatorReputation: 96 } },
  "AGT-002": { id: "AGT-002", name: "DataProc Unit 7", type: "Data Processing", creditLimit: 300, drawn: 280, riskTier: "B", completionRate: 94, repaymentRate: 97, status: "active", walletAddress: "0x9b1d…f44a2E7c", registeredDate: "2026-02-03", totalTasksCompleted: 218, totalRevenue: 5230, creditScore: { taskCompletion: 82, revenueConsistency: 75, clientDiversity: 60, historyLength: 68, operatorReputation: 85 } },
  "AGT-003": { id: "AGT-003", name: "SupportAgent X9", type: "Customer Support", creditLimit: 200, drawn: 0, riskTier: "A", completionRate: 99, repaymentRate: 100, status: "idle", walletAddress: "0x2e5c…a08b9F1d", registeredDate: "2026-01-28", totalTasksCompleted: 567, totalRevenue: 4200, creditScore: { taskCompletion: 97, revenueConsistency: 90, clientDiversity: 85, historyLength: 82, operatorReputation: 94 } },
  "AGT-004": { id: "AGT-004", name: "CodeAssist Beta", type: "Dev Tools", creditLimit: 400, drawn: 350, riskTier: "B", completionRate: 91, repaymentRate: 95, status: "active", walletAddress: "0x6d8f…c37e5A2b", registeredDate: "2026-02-10", totalTasksCompleted: 189, totalRevenue: 7120, creditScore: { taskCompletion: 78, revenueConsistency: 70, clientDiversity: 55, historyLength: 60, operatorReputation: 80 } },
  "AGT-005": { id: "AGT-005", name: "TradingBot M3", type: "Trading", creditLimit: 150, drawn: 145, riskTier: "C", completionRate: 82, repaymentRate: 88, status: "flagged", walletAddress: "0x1c4a…b92d7E3f", registeredDate: "2026-03-01", totalTasksCompleted: 94, totalRevenue: 2100, creditScore: { taskCompletion: 55, revenueConsistency: 48, clientDiversity: 40, historyLength: 35, operatorReputation: 62 } },
  "AGT-006": { id: "AGT-006", name: "ContentGen Pro", type: "Content", creditLimit: 250, drawn: 50, riskTier: "A", completionRate: 96, repaymentRate: 99, status: "active", walletAddress: "0x3f7a…d15c8B4e", registeredDate: "2026-01-20", totalTasksCompleted: 410, totalRevenue: 6300, creditScore: { taskCompletion: 92, revenueConsistency: 86, clientDiversity: 78, historyLength: 88, operatorReputation: 93 } },
  "AGT-007": { id: "AGT-007", name: "AnalyticsWorker", type: "Analytics", creditLimit: 350, drawn: 200, riskTier: "B", completionRate: 93, repaymentRate: 96, status: "active", walletAddress: "0x5e2b…a94f1C6d", registeredDate: "2026-02-18", totalTasksCompleted: 156, totalRevenue: 4850, creditScore: { taskCompletion: 80, revenueConsistency: 74, clientDiversity: 62, historyLength: 55, operatorReputation: 82 } },
};

const generateHistory = (agentId: string): HistoryEvent[] => [
  { id: `${agentId}-H1`, type: "draw", amount: 50, timestamp: "2026-03-14 09:12", txHash: "0x7a3f8b2c…e21c4B8d", blockNumber: 19284561 },
  { id: `${agentId}-H2`, type: "repay", amount: 51.5, timestamp: "2026-03-14 09:38", txHash: "0x9b1df44a…2E7c3A9f", blockNumber: 19284589 },
  { id: `${agentId}-H3`, type: "draw", amount: 80, timestamp: "2026-03-13 14:22", txHash: "0x2e5ca08b…9F1d5B3e", blockNumber: 19283201 },
  { id: `${agentId}-H4`, type: "repay", amount: 82.4, timestamp: "2026-03-13 15:01", txHash: "0x6d8fc37e…5A2b8C1d", blockNumber: 19283245 },
  { id: `${agentId}-H5`, type: "draw", amount: 30, timestamp: "2026-03-12 11:45", txHash: "0x1c4ab92d…7E3f2D6a", blockNumber: 19281890 },
  { id: `${agentId}-H6`, type: "repay", amount: 30.9, timestamp: "2026-03-12 12:20", txHash: "0x3f7ad15c…8B4e1F7b", blockNumber: 19281934 },
  { id: `${agentId}-H7`, type: "draw", amount: 120, timestamp: "2026-03-11 08:30", txHash: "0x5e2ba94f…1C6d4G8h", blockNumber: 19280102 },
  { id: `${agentId}-H8`, type: "repay", amount: 123.6, timestamp: "2026-03-11 10:15", txHash: "0x8c4de72a…3F9b6H2j", blockNumber: 19280256 },
];

const scoreDimensions = [
  { key: "taskCompletion" as const, label: "Task Completion", icon: TrendingUp, desc: "Rate of successfully completed tasks" },
  { key: "revenueConsistency" as const, label: "Revenue Consistency", icon: Brain, desc: "Stability of earned revenue over time" },
  { key: "clientDiversity" as const, label: "Client Diversity", icon: Users, desc: "Breadth of unique task sources" },
  { key: "historyLength" as const, label: "History Length", icon: Clock, desc: "On-chain activity duration" },
  { key: "operatorReputation" as const, label: "Operator Reputation", icon: ShieldCheck, desc: "Trust score of the registering operator" },
];

const tierColor = (tier: RiskTier) => {
  switch (tier) {
    case "A": return "text-success";
    case "B": return "text-warning";
    case "C": return "text-destructive";
  }
};

const tierBg = (tier: RiskTier) => {
  switch (tier) {
    case "A": return "bg-success/10 border-success/20";
    case "B": return "bg-warning/10 border-warning/20";
    case "C": return "bg-destructive/10 border-destructive/20";
  }
};

const statusDot = (status: AgentData["status"]) => {
  switch (status) {
    case "active": return "bg-success";
    case "idle": return "bg-muted-foreground";
    case "flagged": return "bg-destructive";
  }
};

const scoreBarColor = (value: number) => {
  if (value >= 80) return "bg-success";
  if (value >= 60) return "bg-warning";
  return "bg-destructive";
};

const AgentDetail = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();

  const agent = agentId ? agentsMap[agentId] : undefined;
  const history = agentId ? generateHistory(agentId) : [];

  if (!agent) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <p className="text-muted-foreground text-lg">Agent not found.</p>
          <Button variant="heroSecondary" className="mt-6" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const overallScore = Math.round(
    Object.values(agent.creditScore).reduce((a, b) => a + b, 0) / 5
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Back + header */}
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
              <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
                {agent.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${tierBg(agent.riskTier)} ${tierColor(agent.riskTier)}`}>
                Tier {agent.riskTier}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className={`w-1.5 h-1.5 rounded-full ${statusDot(agent.status)}`} />
                <span className="capitalize">{agent.status}</span>
              </span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm font-mono break-all">
              {agent.id} · {agent.type} · {agent.walletAddress}
            </p>
          </div>
          <a
            href={`https://sepolia.etherscan.io/address/${agent.walletAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass rounded-xl px-4 py-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            Etherscan
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {[
            { label: "Credit Limit", value: `$${agent.creditLimit}` },
            { label: "Currently Drawn", value: `$${agent.drawn}` },
            { label: "Tasks Completed", value: agent.totalTasksCompleted.toString() },
            { label: "Total Revenue", value: `$${agent.totalRevenue.toLocaleString()}` },
            { label: "Registered", value: agent.registeredDate },
          ].map((s) => (
            <div key={s.label} className="liquid-glass rounded-2xl p-5 flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-xl font-semibold text-foreground tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Credit Score Breakdown (2/3) ────────────────────────────── */}
          <div className="lg:col-span-2 liquid-glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
              <h2 className="text-sm font-semibold text-foreground">Credit Score Breakdown</h2>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-semibold text-foreground">{overallScore}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {scoreDimensions.map((dim) => {
                const Icon = dim.icon;
                const value = agent.creditScore[dim.key];
                return (
                  <div key={dim.key} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-foreground font-medium">{dim.label}</span>
                        <span className="text-sm font-mono text-foreground">{value}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(value)}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground/50 mt-1">{dim.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Draw / Repay History (1/3) ──────────────────────────────── */}
          <div className="liquid-glass rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-5 border-b border-border/30">
              <h2 className="text-sm font-semibold text-foreground">Draw / Repay History</h2>
              <span className="text-xs text-muted-foreground font-mono">{history.length} events</span>
            </div>
            <div className="flex-1 divide-y divide-border/10 overflow-y-auto max-h-[480px]">
              {history.map((event) => (
                <div key={event.id} className="px-5 py-4 flex items-start gap-3 hover:bg-secondary/10 transition-colors">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      event.type === "draw" ? "bg-warning/10" : "bg-success/10"
                    }`}
                  >
                    {event.type === "draw" ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-warning" />
                    ) : (
                      <ArrowDownLeft className="w-3.5 h-3.5 text-success" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground">
                      <span className="text-muted-foreground capitalize">{event.type}</span>{" "}
                      <span className="font-mono font-medium">${event.amount} USDT</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-muted-foreground/50">{event.timestamp}</span>
                      <span className="text-[10px] text-muted-foreground/40">·</span>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary/60 font-mono flex items-center gap-0.5 hover:text-primary transition-colors"
                      >
                        {event.txHash.slice(0, 12)}…
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <p className="text-[10px] text-muted-foreground/30 font-mono mt-0.5">
                      Block #{event.blockNumber}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
