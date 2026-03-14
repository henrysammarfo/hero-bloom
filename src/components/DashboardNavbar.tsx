import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Copy, Check, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";

const DashboardNavbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const walletAddress = "0x7a3f…e21c";
  const fullAddress = "0x7a3f8b2ce21c4B8d9F1d5B3e2A7c3A9f";

  const handleCopy = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    toast({
      title: "Wallet Disconnected",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  return (
    <>
      <nav className="w-full py-3 px-3 sm:px-6 flex items-center justify-between gap-2">
        <SidebarTrigger className="md:hidden shrink-0" />

        <div className="flex-1" />

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl bg-secondary/50 border border-border/20 hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl bg-secondary/50 border border-border/20">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse shrink-0" />
            <span className="text-xs font-mono text-foreground hidden sm:inline">{walletAddress}</span>
            <span className="text-xs font-mono text-foreground sm:hidden">0x7a…1c</span>
            <button onClick={handleCopy} className="p-1 rounded-md hover:bg-secondary transition-colors">
              {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 sm:p-2.5 rounded-xl bg-secondary/50 border border-border/20 hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
            aria-label="Disconnect wallet"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </nav>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
    </>
  );
};

export default DashboardNavbar;