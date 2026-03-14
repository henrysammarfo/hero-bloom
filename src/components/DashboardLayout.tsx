// DashboardLayout is now handled by DashboardShell in App.tsx
// This file is kept for backward compatibility but simply renders children
import { forwardRef, ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = forwardRef<HTMLDivElement, DashboardLayoutProps>(({ children }, ref) => {
  return <div ref={ref}>{children}</div>;
});

DashboardLayout.displayName = "DashboardLayout";

export default DashboardLayout;