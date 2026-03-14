import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Droplets, BarChart3, ShieldCheck } from "lucide-react";

const poolStats = [
  { icon: Droplets, label: "Total Value Locked", value: "$2.4M", sub: "USDT" },
  { icon: TrendingUp, label: "Current APY", value: "12.0%", sub: "net to LPs" },
  { icon: BarChart3, label: "Utilisation Rate", value: "73%", sub: "of pool deployed" },
  { icon: ShieldCheck, label: "Risk Controls", value: "5% / 20%", sub: "per agent / operator" },
];

const LendingPool = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-32 px-4 overflow-hidden" style={{ background: "hsl(0, 0%, 0%)" }}>
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(262, 83%, 58%, 0.05) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div
            className={`transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-sm tracking-widest uppercase mb-4" style={{ color: "hsl(0, 0%, 55%)" }}>
              For liquidity providers
            </p>
            <h2
              className="text-4xl md:text-5xl font-semibold tracking-tight mb-6"
              style={{ fontFamily: "'General Sans', sans-serif", color: "hsl(0, 0%, 95%)" }}
            >
              Earn 12% APY
              <br />
              <span style={{ color: "hsl(0, 0%, 55%)" }}>from agent interest.</span>
            </h2>
            <p className="leading-relaxed max-w-md mb-8" style={{ color: "hsl(0, 0%, 55%)" }}>
              Deposit USDT into CIRCUIT's lending pool. Your capital funds autonomous
              agent credit lines — backed by on-chain task revenue and automated
              repayment. Non-custodial. Transparent risk parameters. Weekly interest
              sweep directly to your WDK wallet.
            </p>
            <Button variant="heroSecondary" className="px-8 py-6 text-base">
              Deposit USDT
            </Button>
          </div>

          {/* Right — stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {poolStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`
                    liquid-glass rounded-2xl p-6 flex flex-col gap-4
                    transition-all duration-700 ease-out
                    ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
                  `}
                  style={{ transitionDelay: `${200 + i * 100}ms` }}
                >
                  <Icon className="w-5 h-5" style={{ color: "hsl(0, 0%, 55%)" }} />
                  <div>
                    <p className="text-2xl font-semibold tracking-tight" style={{ color: "hsl(0, 0%, 95%)" }}>
                      {stat.value}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "hsl(0, 0%, 55%)" }}>{stat.sub}</p>
                  </div>
                  <p className="text-xs mt-auto" style={{ color: "hsl(0, 0%, 40%)" }}>{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LendingPool;
