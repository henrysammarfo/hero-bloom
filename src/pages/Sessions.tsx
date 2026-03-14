import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Clock, Filter } from "lucide-react";

interface SessionEvent {
  id: string;
  agentId: string;
  agentName: string;
  type: "draw" | "repay";
  amount: number;
  timestamp: string;
  txHash: string;
  date: string;
}

const sessionEvents: SessionEvent[] = [
  { id: "TX-1", agentId: "AGT-004", agentName: "CodeAssist Beta", type: "draw", amount: 50, timestamp: "12:42 PM", txHash: "0x7a3f…e21c", date: "Today" },
  { id: "TX-2", agentId: "AGT-001", agentName: "ResearchBot Alpha", type: "repay", amount: 103, timestamp: "12:40 PM", txHash: "0x9b1d…f44a", date: "Today" },
  { id: "TX-3", agentId: "AGT-002", agentName: "DataProc Unit 7", type: "draw", amount: 80, timestamp: "12:34 PM", txHash: "0x2e5c…a08b", date: "Today" },
  { id: "TX-4", agentId: "AGT-007", agentName: "AnalyticsWorker", type: "repay", amount: 154.5, timestamp: "12:30 PM", txHash: "0x6d8f…c37e", date: "Today" },
  { id: "TX-5", agentId: "AGT-006", agentName: "ContentGen Pro", type: "draw", amount: 50, timestamp: "12:24 PM", txHash: "0x1c4a…b92d", date: "Today" },
  { id: "TX-6", agentId: "AGT-001", agentName: "ResearchBot Alpha", type: "draw", amount: 75, timestamp: "11:15 AM", txHash: "0x3f2a…d19e", date: "Yesterday" },
  { id: "TX-7", agentId: "AGT-003", agentName: "SupportAgent X9", type: "repay", amount: 200, timestamp: "10:02 AM", txHash: "0x8c7b…a33f", date: "Yesterday" },
  { id: "TX-8", agentId: "AGT-005", agentName: "TradingBot M3", type: "draw", amount: 145, timestamp: "9:45 AM", txHash: "0x5e1d…b77c", date: "Yesterday" },
  { id: "TX-9", agentId: "AGT-004", agentName: "CodeAssist Beta", type: "repay", amount: 300, timestamp: "4:30 PM", txHash: "0x2a9f…c88d", date: "Mar 12" },
  { id: "TX-10", agentId: "AGT-002", agentName: "DataProc Unit 7", type: "draw", amount: 200, timestamp: "2:15 PM", txHash: "0x7f3e…d22a", date: "Mar 12" },
];

type FilterType = "all" | "draw" | "repay";

const Sessions = () => {
  const [filter, setFilter] = useState<FilterType>("all");

  const filtered = filter === "all" ? sessionEvents : sessionEvents.filter(e => e.type === filter);

  const grouped = filtered.reduce<Record<string, SessionEvent[]>>((acc, e) => {
    (acc[e.date] ??= []).push(e);
    return acc;
  }, {});

  const totalDrawn = sessionEvents.filter(e => e.type === "draw").reduce((s, e) => s + e.amount, 0);
  const totalRepaid = sessionEvents.filter(e => e.type === "repay").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Sessions & History</h1>
        <p className="text-muted-foreground text-sm mt-1">All agent draws and repayments</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="liquid-glass rounded-xl p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground/60 uppercase tracking-wider">Total Drawn</p>
          <p className="text-base sm:text-lg font-semibold text-warning font-mono mt-1">${totalDrawn}</p>
        </div>
        <div className="liquid-glass rounded-xl p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground/60 uppercase tracking-wider">Total Repaid</p>
          <p className="text-base sm:text-lg font-semibold text-success font-mono mt-1">${totalRepaid}</p>
        </div>
        <div className="liquid-glass rounded-xl p-3 sm:p-4 text-center">
          <p className="text-[10px] sm:text-xs text-muted-foreground/60 uppercase tracking-wider">Transactions</p>
          <p className="text-base sm:text-lg font-semibold text-foreground font-mono mt-1">{sessionEvents.length}</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-3.5 h-3.5 text-muted-foreground/50" />
        {(["all", "draw", "repay"] as const).map(f => (
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

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, events]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
              <h2 className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">{date}</h2>
            </div>
            <div className="liquid-glass rounded-2xl overflow-hidden divide-y divide-border/10">
              {events.map((event) => (
                <div key={event.id} className="px-3 sm:px-5 py-3 sm:py-4 flex items-center gap-3 hover:bg-secondary/10 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${event.type === "draw" ? "bg-warning/10" : "bg-success/10"}`}>
                    {event.type === "draw" ? (
                      <ArrowUpRight className="w-4 h-4 text-warning" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-success" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-foreground">
                      <span className="font-medium">{event.agentName}</span>{" "}
                      <span className="text-muted-foreground">{event.type === "draw" ? "drew" : "repaid"}</span>{" "}
                      <span className="font-mono font-medium">${event.amount} USDT</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{event.agentId}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{event.timestamp}</p>
                    <button className="text-[10px] text-primary/60 font-mono flex items-center gap-0.5 hover:text-primary transition-colors mt-0.5 ml-auto">
                      <span className="hidden sm:inline">{event.txHash}</span>
                      <span className="sm:hidden">{event.txHash.slice(0, 8)}…</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <div className="liquid-glass rounded-2xl p-10 text-center">
            <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No {filter === "all" ? "" : filter} transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sessions;