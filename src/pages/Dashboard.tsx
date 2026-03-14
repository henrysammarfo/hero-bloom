import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "@/components/DashboardNavbar";
import RegisterAgentModal from "@/components/RegisterAgentModal";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  ChevronDown,
  ExternalLink,
  Activity,
} from "lucide-react";

// ─── Mock data ──────────────────────────────────────────────────────────────

const summaryStats = [
  { label: "Active Credit Lines", value: "47", change: "+3 this week", icon: Users, trend: "up" as const },
  { label: "Total Drawn", value: "$14,200", change: "USDT", icon: DollarSign, trend: "neutral" as const },
  { label: "Repayment Rate", value: "97.1%", change: "+0.3% vs last week", icon: TrendingUp, trend: "up" as const },
  { label: "Time Saved", value: "4.2 hrs", change: "this week", icon: Zap, trend: "up" as const },
];

type RiskTier = "A" | "B" | "C";

interface Agent {
  id: string;
  name: string;
  type: string;
  creditLimit: number;
  drawn: number;
  riskTier: RiskTier;
  completionRate: number;
  repaymentRate: number;
  status: "active" | "idle" | "flagged";
  lastActivity: string;
}

const agents: Agent[] = [
  { id: "AGT-001", name: "ResearchBot Alpha", type: "Research", creditLimit: 500, drawn: 120, riskTier: "A", completionRate: 98, repaymentRate: 100, status: "active", lastActivity: "2 min ago" },
  { id: "AGT-002", name: "DataProc Unit 7", type: "Data Processing", creditLimit: 300, drawn: 280, riskTier: "B", completionRate: 94, repaymentRate: 97, status: "active", lastActivity: "8 min ago" },
  { id: "AGT-003", name: "SupportAgent X9", type: "Customer Support", creditLimit: 200, drawn: 0, riskTier: "A", completionRate: 99, repaymentRate: 100, status: "idle", lastActivity: "1 hr ago" },
  { id: "AGT-004", name: "CodeAssist Beta", type: "Dev Tools", creditLimit: 400, drawn: 350, riskTier: "B", completionRate: 91, repaymentRate: 95, status: "active", lastActivity: "30 sec ago" },
  { id: "AGT-005", name: "TradingBot M3", type: "Trading", creditLimit: 150, drawn: 145, riskTier: "C", completionRate: 82, repaymentRate: 88, status: "flagged", lastActivity: "45 min ago" },
  { id: "AGT-006", name: "ContentGen Pro", type: "Content", creditLimit: 250, drawn: 50, riskTier: "A", completionRate: 96, repaymentRate: 99, status: "active", lastActivity: "5 min ago" },
  { id: "AGT-007", name: "AnalyticsWorker", type: "Analytics", creditLimit: 350, drawn: 200, riskTier: "B", completionRate: 93, repaymentRate: 96, status: "active", lastActivity: "12 min ago" },
];

interface DrawEvent {
  id: string;
  agentId: string;
  agentName: string;
  type: "draw" | "repay";
  amount: number;
  timestamp: string;
  txHash: string;
}

const recentDraws: DrawEvent[] = [
  { id: "TX-1", agentId: "AGT-004", agentName: "CodeAssist Beta", type: "draw", amount: 50, timestamp: "30 sec ago", txHash: "0x7a3f…e21c" },
  { id: "TX-2", agentId: "AGT-001", agentName: "ResearchBot Alpha", type: "repay", amount: 103, timestamp: "2 min ago", txHash: "0x9b1d…f44a" },
  { id: "TX-3", agentId: "AGT-002", agentName: "DataProc Unit 7", type: "draw", amount: 80, timestamp: "8 min ago", txHash: "0x2e5c…a08b" },
  { id: "TX-4", agentId: "AGT-007", agentName: "AnalyticsWorker", type: "repay", amount: 154.5, timestamp: "12 min ago", txHash: "0x6d8f…c37e" },
  { id: "TX-5", agentId: "AGT-006", agentName: "ContentGen Pro", type: "draw", amount: 50, timestamp: "18 min ago", txHash: "0x1c4a…b92d" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const tierColor = (tier: RiskTier) => {
  switch (tier) {
    case "A": return "text-success";
    case "B": return "text-warning";
    case "C": return "text-destructive";
  }
};

const statusDot = (status: Agent["status"]) => {
  switch (status) {
    case "active": return "bg-success";
    case "idle": return "bg-muted-foreground";
    case "flagged": return "bg-destructive";
  }
};

const utilPercent = (drawn: number, limit: number) => Math.round((drawn / limit) * 100);

// ─── Component ───────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const navigate = useNavigate();

  const filteredAgents = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar />
      <RegisterAgentModal open={registerOpen} onClose={() => setRegisterOpen(false)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Operator Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Wei's fleet · 47 active agents · Sepolia testnet
            </p>
          </div>
          <Button variant="heroSecondary" className="gap-2 px-5 py-5 w-full sm:w-auto" onClick={() => setRegisterOpen(true)}>
            <Plus className="w-4 h-4" />
            Register Agent
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {summaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="liquid-glass rounded-2xl p-4 sm:p-5 flex flex-col gap-2 sm:gap-3"
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {stat.trend === "up" && (
                    <span className="text-[10px] text-success font-mono">▲</span>
                  )}
                </div>
                <p className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.change}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Agent table (2/3 width) ──────────────────────────────────── */}
          <div className="lg:col-span-2 liquid-glass rounded-2xl overflow-hidden">
            {/* Table header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border/30">
              <h2 className="text-sm font-semibold text-foreground">Agent Credit Lines</h2>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search agents…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    maxLength={100}
                    className="bg-secondary/50 border border-border/30 rounded-lg text-xs text-foreground pl-8 pr-3 py-2 w-full sm:w-44 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
                <button className="p-2 rounded-lg hover:bg-secondary/50 transition-colors shrink-0">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Table — scrollable on mobile */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/20">
                    {["Agent", "Risk", "Credit", "Utilisation", "Repayment", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left text-muted-foreground/60 font-medium px-4 sm:px-5 py-3 uppercase tracking-wider"
                        >
                          <span className="flex items-center gap-1 cursor-pointer hover:text-muted-foreground transition-colors">
                            {h}
                            <ChevronDown className="w-3 h-3" />
                          </span>
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-border/10 hover:bg-secondary/20 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/dashboard/${agent.id}`)}
                    >
                      <td className="px-4 sm:px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-foreground font-medium">{agent.name}</span>
                          <span className="text-muted-foreground/50 font-mono">
                            {agent.id} · {agent.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <span className={`font-mono font-bold ${tierColor(agent.riskTier)}`}>
                          {agent.riskTier}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <span className="text-foreground">
                          ${agent.drawn}
                          <span className="text-muted-foreground/50">
                            {" "}/ ${agent.creditLimit}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                utilPercent(agent.drawn, agent.creditLimit) > 90
                                  ? "bg-destructive"
                                  : utilPercent(agent.drawn, agent.creditLimit) > 70
                                  ? "bg-warning"
                                  : "bg-success"
                              }`}
                              style={{
                                width: `${utilPercent(agent.drawn, agent.creditLimit)}%`,
                              }}
                            />
                          </div>
                          <span className="text-muted-foreground font-mono">
                            {utilPercent(agent.drawn, agent.creditLimit)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <span className="text-foreground font-mono">{agent.repaymentRate}%</span>
                      </td>
                      <td className="px-4 sm:px-5 py-4">
                        <span className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot(agent.status)}`} />
                          <span className="text-muted-foreground capitalize">{agent.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Activity feed (1/3 width) ────────────────────────────────── */}
          <div className="liquid-glass rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                Live Activity
              </h2>
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>

            <div className="flex-1 divide-y divide-border/10">
              {recentDraws.map((event) => (
                <div key={event.id} className="px-4 sm:px-5 py-4 flex items-start gap-3 hover:bg-secondary/10 transition-colors">
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
                      <span className="font-medium">{event.agentName}</span>{" "}
                      <span className="text-muted-foreground">
                        {event.type === "draw" ? "drew" : "repaid"}
                      </span>{" "}
                      <span className="font-mono font-medium">
                        ${event.amount} USDT
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground/50">
                        {event.timestamp}
                      </span>
                      <button className="text-[10px] text-primary/60 font-mono flex items-center gap-0.5 hover:text-primary transition-colors">
                        {event.txHash}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly digest preview */}
            <div className="px-4 sm:px-5 py-4 border-t border-border/30 bg-secondary/10">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2">
                Weekly Digest
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your 47 agents completed <span className="text-foreground font-medium">340 tasks</span>.
                Credit utilisation: <span className="text-foreground font-medium">73%</span>.
                Repayment rate: <span className="text-success font-medium">97.1%</span>.
                Est. time saved: <span className="text-foreground font-medium">4.2 hours</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
