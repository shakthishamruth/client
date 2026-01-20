import { Bell, Search, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title = "Dashboard", className }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };
  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl",
      className
    )}>
      {/* Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2 h-10 rounded-lg hover:bg-gray-100">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.userId}`} alt="User" />
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {user?.userId?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left md:block">
                <p className="text-[14px] font-semibold text-foreground">{user?.userId}</p>
                <p className="text-[12px] text-muted-foreground">{user?.role}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg rounded-xl">
            <DropdownMenuItem asChild className="gap-2 cursor-pointer text-[14px] font-medium hover:bg-gray-100 rounded-lg mx-1 my-1">
              <Link to="/profile">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border my-1" />
            <DropdownMenuItem 
              className="gap-2 cursor-pointer text-destructive focus:text-destructive text-[14px] font-medium hover:bg-red-50 rounded-lg mx-1 my-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
