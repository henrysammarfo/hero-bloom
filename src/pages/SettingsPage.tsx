import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon, Copy, Check, Wallet, Bell, CreditCard, Palette } from "lucide-react";

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [notifications, setNotifications] = useState({
    draws: true,
    repayments: true,
    riskAlerts: true,
    weeklyDigest: false,
  });
  const [defaultLimit, setDefaultLimit] = useState("300");

  const walletAddress = "0x7a3f8b2ce21c4B8d9F1d5B3e2A7c3A9f";

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your profile and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Wallet & Identity */}
          <section className="liquid-glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Wallet & Identity</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground/60 uppercase tracking-wider">Connected Wallet</label>
                <div className="mt-1.5 flex items-center gap-2 bg-secondary/30 border border-border/20 rounded-xl px-4 py-3">
                  <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-sm font-mono text-foreground flex-1 truncate">{walletAddress}</span>
                  <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                    {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground/60 uppercase tracking-wider">Display Name</label>
                <input
                  type="text"
                  defaultValue="Wei"
                  className="mt-1.5 w-full bg-secondary/30 border border-border/20 rounded-xl text-sm text-foreground px-4 py-3 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="liquid-glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-3">
              {([
                ["draws", "Draw alerts", "Get notified when an agent draws credit"],
                ["repayments", "Repayment alerts", "Get notified on repayments"],
                ["riskAlerts", "Risk alerts", "Alerts when agents hit high utilisation"],
                ["weeklyDigest", "Weekly digest", "Summary email every Monday"],
              ] as const).map(([key, label, desc]) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground/60">{desc}</p>
                  </div>
                  <button
                    onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                    className={`w-10 h-6 rounded-full transition-colors relative ${notifications[key] ? "bg-primary" : "bg-secondary"}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${notifications[key] ? "left-5" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Default Credit Limits */}
          <section className="liquid-glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Default Credit Limits</h2>
            </div>
            <div>
              <label className="text-xs text-muted-foreground/60 uppercase tracking-wider">Default limit for new agents (USDT)</label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="number"
                  value={defaultLimit}
                  onChange={(e) => setDefaultLimit(e.target.value)}
                  min={50}
                  max={10000}
                  className="w-32 bg-secondary/30 border border-border/20 rounded-xl text-sm text-foreground px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <span className="text-sm text-muted-foreground">USDT</span>
              </div>
              <p className="text-xs text-muted-foreground/50 mt-2">This will be pre-filled when registering new agents.</p>
            </div>
          </section>

          {/* Theme */}
          <section className="liquid-glass rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">Theme</p>
                <p className="text-xs text-muted-foreground/60">Switch between dark and light mode</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 hover:bg-secondary transition-colors"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm text-foreground capitalize">{theme === "dark" ? "Light" : "Dark"}</span>
              </button>
            </div>
          </section>

          <Button variant="heroSecondary" className="w-full py-5">Save Changes</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
