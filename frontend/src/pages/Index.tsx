
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { VoucherDashboard } from "@/components/VoucherDashboard";
import { VoucherGenerator } from "@/components/VoucherGenerator";
import { VoucherList } from "@/components/VoucherList";

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
            <header className="mb-8">
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
