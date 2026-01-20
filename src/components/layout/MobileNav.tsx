import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  Zap, 
  Code2, 
  Trophy, 
  User 
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Daily", url: "/daily", icon: Zap },
  { title: "Problems", url: "/problems", icon: Code2 },
  { title: "Rank", url: "/leaderboard", icon: Trophy },
  { title: "Profile", url: "/profile", icon: User },
];

export function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            end={item.url === "/"}
            className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
