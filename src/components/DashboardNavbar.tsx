import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Copy, Check, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import logo from "@/assets/logo.svg";

const DashboardNavbar = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  const walletAddress = "0x7a3f…e21c";
  const fullAddress = "0x7a3f8b2ce21c4B8d9F1d5B3e2A7c3A9f";

  const handleCopy = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <nav className="w-full py-4 px-4 sm:px-8 flex items-center justify-between">
        <img
          src={logo}
          alt="CIRCUIT Logo"
          className="h-7 sm:h-8 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-secondary/50 border border-border/30 hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {/* Wallet pill */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 border border-border/30">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-foreground hidden sm:inline">
              {walletAddress}
            </span>
            <span className="text-xs font-mono text-foreground sm:hidden">
              0x7a…1c
            </span>
            <button
              onClick={handleCopy}
              className="p-1 rounded-md hover:bg-secondary transition-colors"
            >
              {copied ? (
                <Check className="w-3 h-3 text-success" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          </div>

          {/* Disconnect */}
          <button
            className="p-2.5 rounded-xl bg-secondary/50 border border-border/30 hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
            aria-label="Disconnect wallet"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </nav>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </>
  );
};

export default DashboardNavbar;
