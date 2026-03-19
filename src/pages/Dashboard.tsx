import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterAgentModal from "@/components/RegisterAgentModal";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Search,
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  ChevronDown,
  ExternalLink,
  Activity,
} from "lucide-react";
import { useOperatorAgents } from "@/hooks/useOperatorAgents";
import { usePoolActivity } from "@/hooks/usePoolActivity";
import { hasContracts } from "@/lib/contracts";

const tierColor = (tier: string) => tier === "A" ? "text-success" : tier === "B" ? "text-warning" : "text-destructive";

function shortId(id: string) {
  if (!id || id.length < 10) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

function shortTx(hash: string) {
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const navigate = useNavigate();
  const { agents, isLoading: agentsLoading, refetch } = useOperatorAgents();
  const { events: poolEvents, isLoading: activityLoading } = usePoolActivity(15);

  const filteredAgents = agents.filter(
    (a) =>
      shortId(a.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.wallet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = agents.filter((a) => a.active).length;
  const totalDrawn = agents.reduce((s, a) => s + a.drawn, 0);
  const totalLimit = agents.reduce((s, a) => s + a.creditLimit, 0);
  const repaymentRate = totalLimit > 0 ? Math.round((1 - totalDrawn / totalLimit) * 100) : 0;

  const summaryStats = [
    { label: "Active Credit Lines", value: String(activeCount), change: "on-chain", icon: Users, trend: "up" as const },
    { label: "Total Drawn", value: `$${totalDrawn.toLocaleString()}`, change: "USDT", icon: DollarSign, trend: "neutral" as const },
    { label: "Repayment Rate", value: `${repaymentRate}%`, change: "vs limit", icon: TrendingUp, trend: "up" as const },
    { label: "Agents", value: String(agents.length), change: "registered", icon: Zap, trend: "up" as const },
  ];

  return (
    <>
      <RegisterAgentModal open={registerOpen} onClose={() => setRegisterOpen(false)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Operator Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {!hasContracts ? "Deploy contracts to register agents" : agentsLoading ? "Loading…" : `${activeCount} active · ${agents.length} agents · Sepolia`}
            </p>
          </div>
          <Button variant="heroSecondary" className="gap-2 px-5 py-5 w-full sm:w-auto" onClick={() => setRegisterOpen(true)}>
            <Plus className="w-4 h-4" /> Register Agent
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          {summaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="liquid-glass rounded-2xl p-4 sm:p-5 flex flex-col gap-2 sm:gap-3">
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {stat.trend === "up" && <span className="text-[10px] text-success font-mono">▲</span>}
                </div>
                <p className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.change}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 liquid-glass rounded-2xl overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-border/30">
              <h2 className="text-sm font-semibold text-foreground">Agent Credit Lines</h2>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by id or wallet…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    maxLength={100}
                    className="bg-secondary/50 border border-border/30 rounded-lg text-xs text-foreground pl-8 pr-3 py-2 w-full sm:w-44 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-border/20">
                    {["Agent", "Risk", "Credit", "Utilisation", "Status"].map((h) => (
                      <th key={h} className="text-left text-muted-foreground/60 font-medium px-4 sm:px-5 py-3 uppercase tracking-wider">
                        <span className="flex items-center gap-1">{h}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agentsLoading ? (
                    <tr>
                      <td colSpan={5} className="px-4 sm:px-5 py-8 text-center text-muted-foreground">
                        Loading agents…
                      </td>
                    </tr>
                  ) : !hasContracts ? (
                    <tr>
                      <td colSpan={5} className="px-4 sm:px-5 py-8 text-center text-muted-foreground">
                        Deploy contracts and add VITE_CIRCUIT_* to .env to see agents.
                      </td>
                    </tr>
                  ) : filteredAgents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 sm:px-5 py-8 text-center text-muted-foreground">
                        No agents yet. Register an agent to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredAgents.map((agent) => (
                      <tr
                        key={agent.id}
                        className="border-b border-border/10 hover:bg-secondary/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/dashboard/${agent.id}`)}
                      >
                        <td className="px-4 sm:px-5 py-4">
                          <div className="flex flex-col">
                            <span className="text-foreground font-mono">{shortId(agent.id)}</span>
                            <span className="text-muted-foreground/50 font-mono text-[10px]">{agent.wallet.slice(0, 10)}…</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-4">
                          <span className={`font-mono font-bold ${tierColor(agent.riskTier)}`}>{agent.riskTier}</span>
                        </td>
                        <td className="px-4 sm:px-5 py-4">
                          <span className="text-foreground">${agent.drawn}<span className="text-muted-foreground/50"> / ${agent.creditLimit}</span></span>
                        </td>
                        <td className="px-4 sm:px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full ${agent.utilization > 90 ? "bg-destructive" : agent.utilization > 70 ? "bg-warning" : "bg-success"}`}
                                style={{ width: `${agent.utilization}%` }}
                              />
                            </div>
                            <span className="text-muted-foreground font-mono">{agent.utilization}%</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-4">
                          <span className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${agent.active ? "bg-success" : "bg-muted-foreground"}`} />
                            <span className="text-muted-foreground capitalize">{agent.active ? "active" : "inactive"}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="liquid-glass rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-muted-foreground" /> Live Activity
              </h2>
              {hasContracts && <span className="w-2 h-2 rounded-full bg-success animate-pulse" />}
            </div>
            <div className="flex-1 divide-y divide-border/10 min-h-[200px]">
              {activityLoading ? (
                <div className="px-4 sm:px-5 py-8 text-center text-muted-foreground text-xs">Loading activity…</div>
              ) : poolEvents.length === 0 ? (
                <div className="px-4 sm:px-5 py-8 text-center text-muted-foreground text-xs">
                  Draw and repay activity from the pool will appear here.
                </div>
              ) : (
                poolEvents.map((event) => (
                  <div key={event.id} className="px-4 sm:px-5 py-4 flex items-start gap-3 hover:bg-secondary/10 transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${event.type === "draw" ? "bg-warning/10" : "bg-success/10"}`}>
                      {event.type === "draw" ? <ArrowUpRight className="w-3.5 h-3.5 text-warning" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-success" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground">
                        <span className="font-mono">{shortId(event.agentId)}</span>{" "}
                        <span className="text-muted-foreground">{event.type === "draw" ? "drew" : "repaid"}</span>{" "}
                        <span className="font-mono font-medium">${event.amount.toLocaleString()} USDT</span>
                      </p>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary/60 font-mono flex items-center gap-0.5 hover:text-primary transition-colors mt-1"
                      >
                        {shortTx(event.transactionHash)} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-4 sm:px-5 py-4 border-t border-border/30 bg-secondary/10">
              <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-2">Sepolia</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Activity is read from CircuitPool Draw/Repay events. Register agents and use the pool to see live data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
