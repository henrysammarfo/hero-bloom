import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterAgentModal from "@/components/RegisterAgentModal";
import { Button } from "@/components/ui/button";
import { Plus, Search, Bot } from "lucide-react";
import { useOperatorAgents } from "@/hooks/useOperatorAgents";
import { hasContracts } from "@/lib/contracts";

function shortId(id: string) {
  if (!id || id.length < 10) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

const tierColor = (t: string) => t === "A" ? "text-success" : t === "B" ? "text-warning" : "text-destructive";

const Agents = () => {
  const [search, setSearch] = useState("");
  const [registerOpen, setRegisterOpen] = useState(false);
  const navigate = useNavigate();
  const { agents, isLoading } = useOperatorAgents();

  const filtered = agents.filter(
    (a) =>
      shortId(a.id).toLowerCase().includes(search.toLowerCase()) ||
      a.wallet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <RegisterAgentModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">My Agents</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {!hasContracts ? "Deploy contracts to register agents" : isLoading ? "Loading…" : `${agents.length} registered agents`}
            </p>
          </div>
          <Button variant="heroSecondary" className="gap-2 px-5 py-5 w-full sm:w-auto" onClick={() => setRegisterOpen(true)}>
            <Plus className="w-4 h-4" /> Register Agent
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by id or wallet…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/50 border border-border/30 rounded-xl text-sm text-foreground pl-10 pr-4 py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        {!hasContracts ? (
          <div className="liquid-glass rounded-2xl p-10 text-center text-muted-foreground">
            <p>Add contract addresses to .env and deploy to see agents.</p>
          </div>
        ) : isLoading ? (
          <div className="liquid-glass rounded-2xl p-10 text-center text-muted-foreground">Loading agents…</div>
        ) : filtered.length === 0 ? (
          <div className="liquid-glass rounded-2xl p-10 text-center text-muted-foreground">
            <p>No agents yet. Register an agent to get started.</p>
          </div>
        ) : (
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
                    <span className={`w-1.5 h-1.5 rounded-full ${agent.active ? "bg-success" : "bg-muted-foreground"}`} />
                    <span className="text-xs text-muted-foreground capitalize">{agent.active ? "active" : "inactive"}</span>
                  </span>
                </div>
                <h3 className="text-sm font-mono text-foreground">{shortId(agent.id)}</h3>
                <p className="text-xs text-muted-foreground/60 font-mono mt-0.5">{agent.wallet.slice(0, 8)}…{agent.wallet.slice(-6)}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground/50">Credit</p>
                    <p className="text-sm font-mono text-foreground">${agent.drawn}<span className="text-muted-foreground/50"> / ${agent.creditLimit}</span></p>
                  </div>
                  <span className={`text-lg font-mono font-bold ${tierColor(agent.riskTier)}`}>{agent.riskTier}</span>
                </div>
                <div className="mt-3 w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${agent.utilization > 90 ? "bg-destructive" : agent.utilization > 70 ? "bg-warning" : "bg-success"}`}
                    style={{ width: `${agent.utilization}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Agents;
