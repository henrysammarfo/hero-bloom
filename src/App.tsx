import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import AgentDetail from "./pages/AgentDetail.tsx";
import Agents from "./pages/Agents.tsx";
import Sessions from "./pages/Sessions.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isDashboardRoute = ["/dashboard", "/agents", "/sessions", "/settings"].some(
    (p) => location.pathname === p || location.pathname.startsWith(p + "/")
  ) || location.pathname.startsWith("/dashboard/");

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {isDashboardRoute ? (
          <Routes location={location}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:agentId" element={<AgentDetail />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        ) : (
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <AnimatedRoutes />
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;