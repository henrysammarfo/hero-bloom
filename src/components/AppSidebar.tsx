import { LayoutDashboard, Bot, Clock, Settings, ChevronLeft } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import circuitIcon from "@/assets/circuit-logo.png";

const CircuitLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 32" fill="none" className="h-6 text-foreground">
    <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.8"/>
    <line x1="16" y1="4" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    <line x1="16" y1="20" x2="16" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    <line x1="4" y1="16" x2="12" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    <line x1="20" y1="16" x2="28" y2="16" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    <text x="36" y="22" fontFamily="system-ui, sans-serif" fontSize="18" fontWeight="600" fill="currentColor">CIRCUIT</text>
  </svg>
);

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Agents", url: "/agents", icon: Bot },
  { title: "Sessions", url: "/sessions", icon: Clock },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-background">
      <SidebarHeader className={collapsed ? "p-2 flex items-center justify-center" : "p-4"}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {collapsed ? (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-secondary/30 transition-colors"
              aria-label="Expand sidebar"
            >
              <img src={circuitIcon} alt="CIRCUIT" className="w-6 h-6" />
            </button>
          ) : (
            <>
              <img src={logo} alt="CIRCUIT" className="h-6" />
              {!isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="p-1.5 rounded-lg hover:bg-secondary/30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-muted-foreground transition-transform" />
                </button>
              )}
            </>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="hover:bg-secondary/30"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className={collapsed ? "p-2" : "p-3"}>
        {collapsed ? (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" title="Sepolia Testnet" />
          </div>
        ) : (
          <div className="px-2 py-2 rounded-lg bg-secondary/10 border border-border/5">
            <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">Network</p>
            <p className="text-xs text-foreground font-mono mt-0.5">Sepolia Testnet</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
