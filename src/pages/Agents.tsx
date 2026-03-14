import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterAgentModal from "@/components/RegisterAgentModal";
import { Button } from "@/components/ui/button";
import { Plus, Search, Bot } from "lucide-react";

type RiskTier = "A" | "B" | "C";

interface Agent {
  id: string;
  name: string;
  type: string;
  creditLimit: number;
  drawn: number;
  riskTier: RiskTier;
  status: "active" | "idle" | "flagged";
  lastActivity: string;
}

const agents: Agent[] = [
  { id: "AGT-001", name: "ResearchBot Alpha", type: "Research", creditLimit: 500, drawn: 120, riskTier: "A", status: "active", lastActivity: "2 min ago" },
  { id: "AGT-002", name: "DataProc Unit 7", type: "Data Processing", creditLimit: 300, drawn: 280, riskTier: "B", status: "active", lastActivity: "8 min ago" },
  { id: "AGT-003", name: "SupportAgent X9", type: "Customer Support", creditLimit: 200, drawn: 0, riskTier: "A", status: "idle", lastActivity: "1 hr ago" },
  { id: "AGT-004", name: "CodeAssist Beta", type: "Dev Tools", creditLimit: 400, drawn: 350, riskTier: "B", status: "active", lastActivity: "30 sec ago" },
  { id: "AGT-005", name: "TradingBot M3", type: "Trading", creditLimit: 150, drawn: 145, riskTier: "C", status: "flagged", lastActivity: "45 min ago" },
  { id: "AGT-006", name: "ContentGen Pro", type: "Content", creditLimit: 250, drawn: 50, riskTier: "A", status: "active", lastActivity: "5 min ago" },
  { id: "AGT-007", name: "AnalyticsWorker", type: "Analytics", creditLimit: 350, drawn: 200, riskTier: "B", status: "active", lastActivity: "12 min ago" },
];

const statusDot = (s: Agent["status"]) => s === "active" ? "bg-success" : s === "idle" ? "bg-muted-foreground" : "bg-destructive";
const tierColor = (t: RiskTier) => t === "A" ? "text-success" : t === "B" ? "text-warning" : "text-destructive";

const Agents = () => {
  const [search, setSearch] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const navigate = useNavigate();

  const filtered = agents.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <RegisterAgentModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">My Agents</h1>
            <p className="text-muted-foreground text-sm mt-1">{agents.length} registered agents</p>
          </div>
          <Button variant="heroSecondary" className="gap-2 px-5 py-5 w-full sm:w-auto" onClick={() => setRegisterOpen(true)}>
            <Plus className="w-4 h-4" /> Register Agent
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search agents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/50 border border-border/30 rounded-xl text-sm text-foreground pl-10 pr-4 py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <div
              key={agent.id}
              onClick={() => navigate(`/dashboard/${agent.id}`)}
              className="liquid-glass rounded-2xl p-5 cursor-pointer hover:bg-secondary/20 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot(agent.status)}`} />
                  <span className="text-xs text-muted-foreground capitalize">{agent.status}</span>
                </span>
              </div>
              <h3 className="text-sm font-medium text-foreground">{agent.name}</h3>
              <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{agent.id} · {agent.type}</p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground/50">Credit</p>
                  <p className="text-sm font-mono text-foreground">${agent.drawn}<span className="text-muted-foreground/50"> / ${agent.creditLimit}</span></p>
                </div>
                <span className={`text-lg font-mono font-bold ${tierColor(agent.riskTier)}`}>{agent.riskTier}</span>
              </div>
              <div className="mt-3 w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full ${Math.round((agent.drawn / agent.creditLimit) * 100) > 90 ? "bg-destructive" : Math.round((agent.drawn / agent.creditLimit) * 100) > 70 ? "bg-warning" : "bg-success"}`}
                  style={{ width: `${Math.round((agent.drawn / agent.creditLimit) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-2">Last active {agent.lastActivity}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Agents;