import logo from "@/assets/logo.svg";
import { ExternalLink } from "lucide-react";

const linkGroups = [
  {
    title: "Protocol",
    links: [
      { label: "How It Works", href: "#how-it-works" },
      { label: "Lending Pool", href: "#lending-pool" },
      { label: "Operator Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "WDK Docs", href: "https://docs.tether.io/wdk", external: true },
      { label: "OpenClaw", href: "https://openclaw.org", external: true },
      { label: "Alchemy", href: "https://www.alchemy.com", external: true },
    ],
  },
  {
    title: "Hackathon",
    links: [
      { label: "DoraHacks", href: "https://dorahacks.io", external: true },
      { label: "Galáctica WDK", href: "https://dorahacks.io/hackathon/galactica", external: true },
      { label: "GitHub", href: "https://github.com", external: true },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="relative bg-background border-t border-border/20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <img src={logo} alt="CIRCUIT" className="h-7 w-fit" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
              Autonomous credit infrastructure for AI agents. Built for Galáctica WDK.
            </p>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-4">
              <h4 className="text-xs text-muted-foreground/60 uppercase tracking-widest font-medium">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      {link.label}
                      {link.external && <ExternalLink className="w-3 h-3" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-border/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/40">
            © 2026 CIRCUIT. Built for the Galáctica WDK Hackathon.
          </p>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground/40">Sepolia testnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
