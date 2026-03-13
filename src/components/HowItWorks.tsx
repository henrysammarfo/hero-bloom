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
    accentClass: "from-primary/20 to-primary/5",
    borderClass: "border-primary/20",
    iconBg: "bg-primary/10",
  },
  {
    icon: RefreshCw,
    label: "02",
    title: "Autonomous Draw + Repay",
    description:
      "Agent draws USDT from pool at task start via WDK. Completes task. Earns revenue. CIRCUIT auto-intercepts principal + 3% interest before remainder goes to operator. No human action required.",
    mechanic: "WDK wallet · Auto-sweep trigger",
    accentClass: "from-success/20 to-success/5",
    borderClass: "border-success/20",
    iconBg: "bg-success/10",
  },
  {
    icon: Vault,
    label: "03",
    title: "Community Lending Pool",
    description:
      "LPs deposit USDT via WDK. Pool lends to agent credit lines. 13.5% interest from agents distributes 12% to LPs with 1.5% spread to CIRCUIT. Max 5% exposure per agent, 20% per operator.",
    mechanic: "Non-custodial · Weekly sweep",
    accentClass: "from-info/20 to-info/5",
    borderClass: "border-info/20",
    iconBg: "bg-info/10",
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
      className="relative bg-background py-32 px-4 overflow-hidden"
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="mb-20">
          <p className="text-muted-foreground text-sm tracking-widest uppercase mb-4">
            The autonomous credit cycle
          </p>
          <h2
            className="text-5xl md:text-6xl font-semibold tracking-tight text-foreground"
            style={{ fontFamily: "'General Sans', sans-serif" }}
          >
            Three agents.
            <br />
            <span className="text-muted-foreground">Zero humans.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className={`
                  relative group rounded-2xl border ${step.borderClass}
                  bg-gradient-to-b ${step.accentClass}
                  p-8 flex flex-col gap-6
                  transition-all duration-700 ease-out
                  ${visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                  }
                `}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                {/* Step number */}
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center`}
                  >
                    <Icon className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono tracking-wider">
                    {step.label}
                  </span>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <h3 className="text-xl font-semibold text-foreground tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <span className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    {step.mechanic}
                  </span>
                </div>

                {/* Connector arrow for non-last cards (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20">
                    <div className="w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
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
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
