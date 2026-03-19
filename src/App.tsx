import { BrowserRouter, Route, Routes, useLocation, Outlet, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/hooks/use-theme";
import { WalletProvider } from "@/components/WalletProvider";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardNavbar from "@/components/DashboardNavbar";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AgentDetail from "./pages/AgentDetail.tsx";
import Agents from "./pages/Agents.tsx";
import Sessions from "./pages/Sessions.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import DocsPage from "./pages/DocsPage.tsx";
import FaucetPage from "./pages/FaucetPage.tsx";
import { useAccount } from "wagmi";

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/** Gate: redirect to landing if wallet not connected */
const RequireWallet = () => {
  const { isConnected } = useAccount();
  if (!isConnected) return <Navigate to="/" replace />;
  return <Outlet />;
};

/** Shared shell for all dashboard routes — sidebar + navbar persist across navigations */
const DashboardShell = () => {
  const location = useLocation();
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardNavbar />
          <main className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <WalletProvider>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route element={<RequireWallet />}>
              <Route element={<DashboardShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/:agentId" element={<AgentDetail />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/faucet" element={<FaucetPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </WalletProvider>
);

export default App;