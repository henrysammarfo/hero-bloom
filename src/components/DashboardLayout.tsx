import { forwardRef, ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardNavbar from "@/components/DashboardNavbar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = forwardRef<HTMLDivElement, DashboardLayoutProps>(({ children }, ref) => {
  return (
    <div ref={ref} className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
});

DashboardLayout.displayName = "DashboardLayout";

export default DashboardLayout;