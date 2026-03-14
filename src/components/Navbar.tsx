import { ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";

const navItems = [
  { label: "How It Works", hasDropdown: false, scrollTo: "how-it-works" },
  { label: "Operators", hasDropdown: false, href: "/dashboard" },
  { label: "LPs", hasDropdown: true, scrollTo: "lending-pool" },
  { label: "Docs", hasDropdown: false, external: "https://docs.tether.io/wdk" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (item: typeof navItems[number]) => {
    if (item.external) {
      window.open(item.external, "_blank");
      return;
    }
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
      <nav className="w-full py-5 px-8 flex flex-row justify-between items-center">
        <img
          src={logo}
          alt="CIRCUIT Logo"
          className="h-8 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className="flex items-center gap-1 text-foreground/90 text-base px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {item.label}
              {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
            </button>
          ))}
        </div>
        <Button variant="heroSecondary" size="sm" className="rounded-full px-4 py-2" onClick={() => navigate("/dashboard")}>
          Launch App
        </Button>
      </nav>
      <div className="mt-[3px] w-full h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </>
  );
};

export default Navbar;
