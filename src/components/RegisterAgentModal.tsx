import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Wallet, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const agentTypes = ["Research", "Data Processing", "Customer Support", "Dev Tools", "Trading", "Content", "Analytics"];

interface RegisterAgentModalProps {
  open: boolean;
  onClose: () => void;
}

const RegisterAgentModal = ({ open, onClose }: RegisterAgentModalProps) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [wallet, setWallet] = useState("");
  const [creditRequest, setCreditRequest] = useState("");
  const [typeOpen, setTypeOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (name.trim().length > 50) e.name = "Name must be under 50 characters";
    if (!type) e.type = "Select an agent type";
    if (!wallet.trim() || !/^0x[a-fA-F0-9]{40}$/.test(wallet.trim())) e.wallet = "Enter a valid Ethereum address (0x…)";
    const credit = Number(creditRequest);
    if (!creditRequest || isNaN(credit) || credit < 50 || credit > 1000) e.creditRequest = "Enter $50 – $1,000 USDT";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    toast({
      title: "Agent Registered",
      description: `${name.trim()} submitted for credit scoring. You'll see the result in ~30 seconds.`,
    });
    setName("");
    setType("");
    setWallet("");
    setCreditRequest("");
    setErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-md liquid-glass rounded-2xl border border-border/30 overflow-hidden max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Register Agent</h2>
                  <p className="text-xs text-muted-foreground">Submit for autonomous credit scoring</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-6 space-y-5">
              {/* Agent Name */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                  <Bot className="w-3 h-3" /> Agent Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. ResearchBot Alpha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={50}
                  className="w-full bg-secondary/50 border border-border/30 rounded-xl text-sm text-foreground px-4 py-3 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              {/* Agent Type (custom dropdown) */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Agent Type</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setTypeOpen(!typeOpen)}
                    className="w-full bg-secondary/50 border border-border/30 rounded-xl text-sm text-left px-4 py-3 flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                  >
                    <span className={type ? "text-foreground" : "text-muted-foreground/40"}>
                      {type || "Select type…"}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${typeOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {typeOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-10 w-full mt-1 bg-card border border-border/30 rounded-xl overflow-hidden shadow-lg"
                      >
                        {agentTypes.map((t) => (
                          <button
                            key={t}
                            onClick={() => { setType(t); setTypeOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                          >
                            {t}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                  <Wallet className="w-3 h-3" /> WDK Wallet Address
                </label>
                <input
                  type="text"
                  placeholder="0x…"
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  maxLength={42}
                  className="w-full bg-secondary/50 border border-border/30 rounded-xl text-sm text-foreground font-mono px-4 py-3 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                {errors.wallet && <p className="text-xs text-destructive">{errors.wallet}</p>}
              </div>

              {/* Credit Request */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> Initial Credit Request (USDT)
                </label>
                <input
                  type="number"
                  placeholder="50 – 1,000"
                  value={creditRequest}
                  onChange={(e) => setCreditRequest(e.target.value)}
                  min={50}
                  max={1000}
                  className="w-full bg-secondary/50 border border-border/30 rounded-xl text-sm text-foreground font-mono px-4 py-3 placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
                />
                {errors.creditRequest && <p className="text-xs text-destructive">{errors.creditRequest}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-border/30 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground/50 max-w-[200px]">
                Credit Scoring Agent will evaluate within ~30 seconds via on-chain data.
              </p>
              <Button variant="heroSecondary" className="px-6 py-5" onClick={handleSubmit}>
                Submit for Scoring
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RegisterAgentModal;
