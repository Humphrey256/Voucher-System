
import { LayoutDashboard, Plus, List, Wifi, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const menuItems = [
  { id: "dashboard", title: "Dashboard", icon: LayoutDashboard },
  { id: "generate", title: "Generate Vouchers", icon: Plus },
  { id: "vouchers", title: "Manage Vouchers", icon: List },
];

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className={collapsed ? "w-14" : "w-64"}>
      <div className="flex justify-end p-2">
        <button
          className="rounded-full bg-blue-600 text-white p-2 shadow hover:bg-blue-700 transition-transform duration-200 focus:outline-none"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 transition-transform duration-200" />
          ) : (
            <ChevronLeft className="w-5 h-5 transition-transform duration-200" />
          )}
        </button>
      </div>
      
      <SidebarContent className="bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wifi className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-semibold text-gray-900">MURONI</h2>
                <p className="text-xs text-gray-500">Voucher System</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.id)}
                    className={`${
                      activeView === item.id
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                        : "hover:bg-gray-50"
                    } transition-colors cursor-pointer`}
                  >
                    <item.icon className="w-4 h-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
