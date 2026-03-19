import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock, Filter } from "lucide-react";
import { usePoolActivity } from "@/hooks/usePoolActivity";
import { hasContracts } from "@/lib/contracts";

function shortId(id: string) {
  if (!id || id.length < 10) return id;
  return `${id.slice(0, 8)}…${id.slice(-6)}`;
}

function shortTx(hash: string) {
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`;
}

type FilterType = "all" | "draw" | "repay";

const Sessions = () => {
  const [filter, setFilter] = useState<FilterType>("all");
  const { events, isLoading } = usePoolActivity(100);

  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);
  const totalDrawn = events.filter((e) => e.type === "draw").reduce((s, e) => s + e.amount, 0);
  const totalRepaid = events.filter((e) => e.type === "repay").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Sessions & History</h1>
        <p className="text-muted-foreground text-sm mt-1">All agent draws and repayments from CircuitPool (on-chain)</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="liquid-glass rounded-xl p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground/60 uppercase tracking-wider">Total Drawn</p>
          <p className="text-base sm:text-lg font-semibold text-warning font-mono mt-1">${totalDrawn.toLocaleString()}</p>
        </div>
        <div className="liquid-glass rounded-xl p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground/60 uppercase tracking-wider">Total Repaid</p>
          <p className="text-base sm:text-lg font-semibold text-success font-mono mt-1">${totalRepaid.toLocaleString()}</p>
        </div>
        <div className="liquid-glass rounded-xl p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground/60 uppercase tracking-wider">Transactions</p>
          <p className="text-base sm:text-lg font-semibold text-foreground font-mono mt-1">{events.length}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-3.5 h-3.5 text-muted-foreground/50" />
        {(["all", "draw", "repay"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-secondary/30 text-muted-foreground border border-border/10 hover:bg-secondary/50"
            }`}
          >
            {f === "all" ? "All" : f === "draw" ? "Draws" : "Repayments"}
          </button>
        ))}
      </div>

      {!hasContracts ? (
        <div className="liquid-glass rounded-2xl p-10 text-center text-muted-foreground text-sm">
          Deploy contracts and add addresses to .env to see on-chain sessions.
        </div>
      ) : isLoading ? (
        <div className="liquid-glass rounded-2xl p-10 text-center text-muted-foreground text-sm">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-10 text-center">
          <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No {filter === "all" ? "" : filter} transactions yet</p>
        </div>
      ) : (
        <div className="liquid-glass rounded-2xl overflow-hidden divide-y divide-border/10">
          {filtered.map((event) => (
            <div key={event.id} className="px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-3 hover:bg-secondary/10 transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${event.type === "draw" ? "bg-warning/10" : "bg-success/10"}`}>
                {event.type === "draw" ? <ArrowUpRight className="w-4 h-4 text-warning" /> : <ArrowDownLeft className="w-4 h-4 text-success" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-foreground">
                  <span className="font-mono">{shortId(event.agentId)}</span>{" "}
                  <span className="text-muted-foreground">{event.type === "draw" ? "drew" : "repaid"}</span>{" "}
                  <span className="font-mono font-medium">${event.amount.toLocaleString()} USDT</span>
                </p>
                <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">Block #{String(event.blockNumber)}</p>
              </div>
              <a
                href={`https://sepolia.etherscan.io/tx/${event.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-primary/60 font-mono flex items-center gap-0.5 hover:text-primary transition-colors shrink-0"
              >
                {shortTx(event.transactionHash)}
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;
