import { ExternalLink, ArrowLeft, Code2, Zap, Shield, Wallet, Brain, RefreshCw, Vault } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.svg";

const endpoints = [
  { method: "POST", path: "/agent/register", desc: "Register agent WDK wallet, link to operator account" },
  { method: "GET", path: "/agent/:id/score", desc: "Return credit score + credit limit for this agent" },
  { method: "POST", path: "/agent/:id/draw", desc: "Agent draws USDT from credit line (authenticated call)" },
  { method: "POST", path: "/agent/:id/repay", desc: "Agent reports task completion + earned revenue → triggers auto-sweep" },
  { method: "GET", path: "/pool/stats", desc: "Pool TVL, current APY to LPs, utilisation rate" },
  { method: "POST", path: "/pool/deposit", desc: "LP deposits USDT into lending pool via WDK" },
  { method: "GET", path: "/operator/:id/agents", desc: "Operator sees all agent credit lines, draw history, repayment rate" },
];

const components = [
  {
    icon: Brain,
    title: "Credit Scoring Agent",
    description: "Reads Wei's agent on-chain history: task completion rate, average revenue per task, payment record, client wallet diversity, operator track record. Generates a credit limit per agent automatically.",
    mechanic: "LLM reads on-chain TX history via Alchemy API. Scores agent on 5 dimensions. Outputs: credit limit in USDT + risk tier (A/B/C).",
  },
  {
    icon: RefreshCw,
    title: "Autonomous Draw + Repayment",
    description: "Agent calls CIRCUIT's API at task start → draws USDT from pool via WDK → completes task → earns revenue → CIRCUIT's repayment agent auto-intercepts principal + 3% interest.",
    mechanic: "WDK wallet handles all flows. Repayment trigger: incoming USDT detected → smart condition fires → sweep to pool.",
  },
  {
    icon: Vault,
    title: "Community Lending Pool",
    description: "LPs deposit USDT via WDK. Pool lends to agent credit lines. Interest (13.5% from agents) distributes to LPs (12%) with 1.5% spread to CIRCUIT.",
    mechanic: "WDK pool wallet. Non-custodial for LPs. Weekly interest sweep. Transparent on-chain risk parameters.",
  },
];

const techStack = [
  { layer: "Frontend", tech: "React + Tailwind (Lovable)", role: "Operator dashboard, LP portal, agent monitoring" },
  { layer: "Backend API", tech: "Node.js + Express + TypeScript", role: "REST API, agent logic, WDK calls" },
  { layer: "Wallet Layer", tech: "WDK by Tether", role: "Creates/manages all wallets, signs transactions" },
  { layer: "Agent Brain", tech: "Claude Haiku 3.5", role: "Credit scoring — reads on-chain history, generates scores" },
  { layer: "Database", tech: "Supabase (Postgres)", role: "Agent records, credit scores, loan history, LP deposits" },
  { layer: "Blockchain", tech: "Ethereum Sepolia", role: "All USDT transactions settle on-chain" },
  { layer: "RPC", tech: "Alchemy", role: "Reads on-chain state, sends transactions" },
];

const DocsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="dark">
      <div style={{ background: "hsl(0, 0%, 0%)", color: "hsl(0, 0%, 95%)", minHeight: "100vh" }}>
        {/* Nav */}
        <nav className="w-full py-5 px-4 sm:px-8 flex items-center justify-between" style={{ borderBottom: "1px solid hsl(0, 0%, 10%)" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm transition-colors" style={{ color: "hsl(0, 0%, 55%)" }}>
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <img src={logo} alt="CIRCUIT" className="h-6 cursor-pointer" onClick={() => navigate("/")} />
          </div>
          <a
            href="https://docs.tether.io/wdk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center gap-1.5 transition-colors"
            style={{ color: "hsl(262, 83%, 58%)" }}
          >
            WDK Docs <ExternalLink className="w-3 h-3" />
          </a>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-4 h-4" style={{ color: "hsl(262, 83%, 58%)" }} />
              <span className="text-xs font-mono uppercase tracking-widest" style={{ color: "hsl(0, 0%, 55%)" }}>Documentation</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-4" style={{ fontFamily: "'General Sans', sans-serif" }}>
              CIRCUIT Protocol
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl" style={{ color: "hsl(0, 0%, 55%)" }}>
              Autonomous credit infrastructure for AI agents. Every agent can access credit, complete tasks, earn revenue, and repay automatically — without a single human in the loop.
            </p>
          </div>

          {/* Vision */}
          <section className="mb-16">
            <div className="rounded-xl p-6 sm:p-8" style={{ background: "hsl(0, 0%, 4%)", border: "1px solid hsl(0, 0%, 10%)" }}>
              <Zap className="w-5 h-5 mb-4" style={{ color: "hsl(262, 83%, 58%)" }} />
              <p className="text-lg font-medium italic leading-relaxed" style={{ color: "hsl(0, 0%, 85%)" }}>
                "Every autonomous AI agent should be able to access credit, complete tasks, earn revenue, and repay automatically — without a single human in the loop."
              </p>
              <p className="text-xs mt-4" style={{ color: "hsl(0, 0%, 40%)" }}>
                CIRCUIT Vision — 5–7 year horizon
              </p>
            </div>
          </section>

          {/* Three components */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Core Components</h2>
            <p className="text-sm mb-8" style={{ color: "hsl(0, 0%, 55%)" }}>Three autonomous components working as a single system.</p>
            <div className="space-y-4">
              {components.map((comp) => {
                const Icon = comp.icon;
                return (
                  <div key={comp.title} className="rounded-xl p-6" style={{ background: "hsl(0, 0%, 3%)", border: "1px solid hsl(0, 0%, 10%)" }}>
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className="w-5 h-5" style={{ color: "hsl(0, 0%, 70%)" }} />
                      <h3 className="text-lg font-semibold">{comp.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: "hsl(0, 0%, 55%)" }}>{comp.description}</p>
                    <p className="text-xs font-mono" style={{ color: "hsl(0, 0%, 40%)" }}>
                      <Shield className="w-3 h-3 inline mr-1" />{comp.mechanic}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* API Reference */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">API Reference</h2>
            <p className="text-sm mb-8" style={{ color: "hsl(0, 0%, 55%)" }}>Minimal, elegant interface — 7 endpoints power the entire protocol.</p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(0, 0%, 10%)" }}>
              {endpoints.map((ep, i) => (
                <div
                  key={ep.path}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-5 py-4"
                  style={{
                    background: "hsl(0, 0%, 3%)",
                    borderBottom: i < endpoints.length - 1 ? "1px solid hsl(0, 0%, 8%)" : "none",
                  }}
                >
                  <span
                    className="text-xs font-mono font-bold px-2 py-1 rounded w-fit"
                    style={{
                      color: ep.method === "GET" ? "hsl(152, 60%, 52%)" : "hsl(38, 92%, 50%)",
                      background: ep.method === "GET" ? "hsl(152, 60%, 52%, 0.1)" : "hsl(38, 92%, 50%, 0.1)",
                    }}
                  >
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono" style={{ color: "hsl(0, 0%, 85%)" }}>{ep.path}</code>
                  <span className="text-xs sm:ml-auto" style={{ color: "hsl(0, 0%, 45%)" }}>{ep.desc}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Tech Stack */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Architecture</h2>
            <p className="text-sm mb-8" style={{ color: "hsl(0, 0%, 55%)" }}>Purpose-built stack for autonomous agent credit.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {techStack.map((item) => (
                <div key={item.layer} className="rounded-xl p-5" style={{ background: "hsl(0, 0%, 3%)", border: "1px solid hsl(0, 0%, 10%)" }}>
                  <p className="text-xs font-mono uppercase tracking-wider mb-2" style={{ color: "hsl(0, 0%, 40%)" }}>{item.layer}</p>
                  <p className="text-sm font-semibold mb-1">{item.tech}</p>
                  <p className="text-xs" style={{ color: "hsl(0, 0%, 50%)" }}>{item.role}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Risk Parameters */}
          <section className="mb-16">
            <h2 className="text-2xl font-semibold tracking-tight mb-2">Risk Parameters</h2>
            <div className="rounded-xl p-6" style={{ background: "hsl(0, 0%, 3%)", border: "1px solid hsl(0, 0%, 10%)" }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: "Interest Rate", value: "3%" },
                  { label: "LP APY", value: "12%" },
                  { label: "Max per Agent", value: "5%" },
                  { label: "Max per Operator", value: "20%" },
                ].map((param) => (
                  <div key={param.label}>
                    <p className="text-2xl font-semibold">{param.value}</p>
                    <p className="text-xs mt-1" style={{ color: "hsl(0, 0%, 45%)" }}>{param.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* External links */}
          <section>
            <h2 className="text-2xl font-semibold tracking-tight mb-6">Resources</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "WDK Documentation", href: "https://docs.tether.io/wdk" },
                { label: "OpenClaw Framework", href: "https://openclaw.org" },
                { label: "Alchemy Dashboard", href: "https://www.alchemy.com" },
                { label: "Sepolia Etherscan", href: "https://sepolia.etherscan.io" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
                  style={{ background: "hsl(0, 0%, 6%)", border: "1px solid hsl(0, 0%, 12%)", color: "hsl(0, 0%, 70%)" }}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  {link.label}
                  <ExternalLink className="w-3 h-3" style={{ color: "hsl(0, 0%, 40%)" }} />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
