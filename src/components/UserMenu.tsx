
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPhoto } from '@/hooks/useUserPhoto';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, ExternalLink, Settings } from 'lucide-react';
import { SettingsModal } from './SettingsModal';

export const UserMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const { photoUrl, loading } = useUserPhoto();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  if (!user) {
    return null;
  }

  const displayName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.name ||
                     'Usuario';

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleViewAccount = () => {
    window.open('https://myaccount.microsoft.com/', '_blank');
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {photoUrl && (
                <AvatarImage 
                  src={photoUrl} 
                  alt={displayName}
                />
              )}
              <AvatarFallback className="bg-skandia-green text-white text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleViewAccount}>
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>Ver cuenta</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenSettings}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configuración</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Cerrar Sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};
