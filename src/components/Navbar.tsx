import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";

const navItems = [
  { label: "How It Works", hasDropdown: false },
  { label: "Operators", hasDropdown: false },
  { label: "LPs", hasDropdown: true },
  { label: "Docs", hasDropdown: false },
];

const Navbar = () => {
  return (
    <>
      <nav className="w-full py-5 px-8 flex flex-row justify-between items-center">
        <img src={logo} alt="CIRCUIT Logo" className="h-8" />
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-1 text-foreground/90 text-base px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              {item.label}
              {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
            </button>
          ))}
        </div>
        <Button variant="heroSecondary" size="sm" className="rounded-full px-4 py-2">
          Launch App
        </Button>
      </nav>
      <div className="mt-[3px] w-full h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
    </>
  );
};

export default Navbar;
