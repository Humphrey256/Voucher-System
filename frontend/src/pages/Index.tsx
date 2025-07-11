
import { useState, useEffect } from "react";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { VoucherDashboard } from "@/components/VoucherDashboard";
import { VoucherGenerator } from "@/components/VoucherGenerator";
import { VoucherList } from "@/components/VoucherList";

function MobileSidebarToggle() {
  const { isMobile, toggleSidebar } = useSidebar();
  if (!isMobile) return null;
  return (
    <button
      onClick={toggleSidebar}
      className="inline-flex items-center justify-center rounded-md p-2 text-blue-600 bg-white shadow hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Open sidebar"
      style={{ position: 'absolute', right: 0, top: 16, zIndex: 50 }}
    >
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu w-6 h-6"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
    </button>
  );
}

const Index = () => {
  const [activeView, setActiveViewState] = useState(() => {
    return localStorage.getItem("muroni-active-view") || "dashboard";
  });

  const setActiveView = (view: string) => {
    setActiveViewState(view);
    localStorage.setItem("muroni-active-view", view);
  };

  useEffect(() => {
    // Sync with localStorage in case it changes elsewhere
    const handleStorage = () => {
      const stored = localStorage.getItem("muroni-active-view");
      if (stored && stored !== activeView) setActiveViewState(stored);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [activeView]);

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <VoucherDashboard />;
      case "generate":
        return <VoucherGenerator />;
      case "vouchers":
        return <VoucherList />;
      default:
        return <VoucherDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-slate-100">
        <AppSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8 relative">
              <MobileSidebarToggle />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                MURONI WiFi Voucher System
              </h1>
              <p className="text-gray-600">
                Generate and manage WiFi access vouchers for your hotspot network
              </p>
            </header>
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
