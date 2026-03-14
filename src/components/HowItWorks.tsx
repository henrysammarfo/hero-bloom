import { useEffect, useRef, useState } from "react";
import { Zap, ArrowRight, Brain, RefreshCw, Vault } from "lucide-react";

const steps = [
  {
    icon: Brain,
    label: "01",
    title: "Credit Scoring Agent",
    description:
      "Reads on-chain history via Alchemy. Evaluates 5 dimensions — task completion rate, revenue consistency, client diversity, history length, operator reputation. Outputs a credit limit in USDT + risk tier (A/B/C).",
    mechanic: "LLM-powered · Claude Haiku 3.5",
  },
  {
    icon: RefreshCw,
    label: "02",
    title: "Autonomous Draw + Repay",
    description:
      "Agent draws USDT from pool at task start via WDK. Completes task. Earns revenue. CIRCUIT auto-intercepts principal + 3% interest before remainder goes to operator. No human action required.",
    mechanic: "WDK wallet · Auto-sweep trigger",
  },
  {
    icon: Vault,
    label: "03",
    title: "Community Lending Pool",
    description:
      "LPs deposit USDT via WDK. Pool lends to agent credit lines. 13.5% interest from agents distributes 12% to LPs with 1.5% spread to CIRCUIT. Max 5% exposure per agent, 20% per operator.",
    mechanic: "Non-custodial · Weekly sweep",
  },
];

const HowItWorks = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 px-4 overflow-hidden"
      style={{ background: "hsl(0, 0%, 0%)" }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(262, 83%, 58%, 0.04) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-20">
          <p className="text-sm tracking-widest uppercase mb-4" style={{ color: "hsl(0, 0%, 55%)" }}>
            The autonomous credit cycle
          </p>
          <h2
            className="text-5xl md:text-6xl font-semibold tracking-tight"
            style={{ fontFamily: "'General Sans', sans-serif", color: "hsl(0, 0%, 95%)" }}
          >
            Three agents.
            <br />
            <span style={{ color: "hsl(0, 0%, 55%)" }}>Zero humans.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "hsl(0, 0%, 12%)" }}>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className={`
                  relative group p-8 flex flex-col gap-6
                  transition-all duration-700 ease-out
                  ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
                `}
                style={{
                  transitionDelay: `${i * 150}ms`,
                  background: "hsl(0, 0%, 3%)",
                }}
              >
                {/* Step number + icon */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "hsl(0, 0%, 8%)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "hsl(0, 0%, 95%)" }} />
                  </div>
                  <span className="text-xs font-mono tracking-wider" style={{ color: "hsl(0, 0%, 40%)" }}>
                    {step.label}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <h3 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(0, 0%, 95%)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "hsl(0, 0%, 55%)" }}>
                    {step.description}
                  </p>
                </div>

                <div className="pt-4" style={{ borderTop: "1px solid hsl(0, 0%, 10%)" }}>
                  <span className="text-xs font-mono flex items-center gap-2" style={{ color: "hsl(0, 0%, 40%)" }}>
                    <Zap className="w-3 h-3" />
                    {step.mechanic}
                  </span>
                </div>

                {/* Connector arrow for non-last cards (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "hsl(0, 0%, 8%)", border: "1px solid hsl(0, 0%, 15%)" }}
                    >
                      <ArrowRight className="w-3 h-3" style={{ color: "hsl(0, 0%, 55%)" }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom stat line */}
        <div
          className={`mt-16 flex flex-wrap items-center justify-center gap-12 transition-all duration-700 delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {[
            { value: "<5 min", label: "Full cycle time" },
            { value: "3%", label: "Interest per draw" },
            { value: "95%+", label: "Target repayment rate" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-semibold" style={{ color: "hsl(0, 0%, 95%)" }}>{stat.value}</p>
              <p className="text-xs mt-1" style={{ color: "hsl(0, 0%, 55%)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
