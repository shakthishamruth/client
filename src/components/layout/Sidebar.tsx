import { NavLink } from "@/components/NavLink";
import { 
  LayoutGrid, 
  Zap, 
  Code2, 
  FileText,
  Trophy, 
  Settings,
  ChevronLeft,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/SidebarContext";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutGrid },
  { title: "Weekly Contest", url: "/weekly-contest", icon: Zap },
  { title: "Problems", url: "/problems", icon: Code2 },
  { title: "DSA Sheet", url: "/dsa-sheet", icon: FileText },
  { title: "Placement 100 Sheet", url: "/placement-75", icon: Target },
  { title: "Leaderboard", url: "/leaderboard", icon: Trophy },
];

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-background transition-all duration-300 rounded-tr-2xl rounded-br-2xl",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center justify-between border-b border-border",
          collapsed ? "px-2" : "px-4"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-900 text-white">
              <span className="text-sm font-bold">A</span>
            </div>
            {!collapsed && <span className="text-lg font-medium">AlgoVerse</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/"}
              title={collapsed ? item.title : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-normal text-gray-600 transition-colors hover:bg-gray-100",
                collapsed && "justify-center px-2"
              )}
              activeClassName="bg-gray-100 text-gray-900 font-semibold"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Settings */}
        <div className="border-t border-border p-3">
          <NavLink
            to="/settings"
            title={collapsed ? "Settings" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-normal text-gray-600 transition-colors hover:bg-gray-100",
              collapsed && "justify-center px-2"
            )}
            activeClassName="bg-gray-100 text-gray-900 font-semibold"
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
