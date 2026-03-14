import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";

const navItems = [
  { label: "How It Works", scrollTo: "how-it-works" },
  { label: "Operators", href: "/dashboard" },
  { label: "LPs", scrollTo: "lending-pool" },
  { label: "Docs", href: "/docs" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (item: typeof navItems[number]) => {
    setMobileOpen(false);
    if (item.href) {
      navigate(item.href);
      return;
    }
    if (item.scrollTo) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.getElementById(item.scrollTo!)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <>
      <nav className="w-full py-5 px-4 sm:px-8 flex flex-row justify-between items-center">
        <img
          src={logo}
          alt="CIRCUIT Logo"
          className="h-7 sm:h-8 cursor-pointer"
          onClick={() => navigate("/")}
        />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className="flex items-center gap-1 text-[hsl(0,0%,95%)]/90 text-base px-3 py-2 rounded-lg hover:bg-[hsl(0,0%,8%)]/50 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="heroSecondary"
            size="sm"
            className="rounded-full px-4 py-2 hidden sm:inline-flex"
            onClick={() => navigate("/dashboard")}
          >
            Launch App
          </Button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[hsl(0,0%,8%)]/50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5 text-[hsl(0,0%,95%)]" /> : <Menu className="w-5 h-5 text-[hsl(0,0%,95%)]" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-b border-[hsl(0,0%,12%)]/20"
          >
            <div className="px-4 pb-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className="w-full flex items-center gap-2 text-[hsl(0,0%,95%)]/90 text-base px-3 py-3 rounded-lg hover:bg-[hsl(0,0%,8%)]/50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button
                variant="heroSecondary"
                className="w-full mt-2 rounded-full"
                onClick={() => { setMobileOpen(false); navigate("/dashboard"); }}
              >
                Launch App
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-[3px] w-full h-px bg-gradient-to-r from-transparent via-[hsl(0,0%,95%)]/20 to-transparent" />
    </>
  );
};

export default Navbar;
