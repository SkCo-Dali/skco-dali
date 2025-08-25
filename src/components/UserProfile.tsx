
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Briefcase } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function UserProfile() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  const handleViewAccount = () => {
    window.open('https://myaccount.microsoft.com/', '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-[#00C73D] text-white">
              {user.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            {user.jobTitle && (
              <div className="flex items-center space-x-1 mt-1">
                <Briefcase className="h-3 w-3 text-[#00C73D]" />
                <span className="text-xs text-muted-foreground capitalize">{user.jobTitle}</span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewAccount}>
          <User className="mr-2 h-4 w-4" />
          <span>Ver cuenta</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-[#3f3f3f]">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
