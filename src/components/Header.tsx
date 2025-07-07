// Header de Dali LM
import { UserProfile } from "@/components/UserProfile";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicBanner } from "@/components/DynamicBanner";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

interface HeaderProps {
  onBannerMessage?: (automaticReply: string) => void;
  chatInterfaceRef?: React.RefObject<any>;
}

export function Header({ onBannerMessage, chatInterfaceRef }: HeaderProps = {}) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Efecto para enviar el mensaje pendiente cuando llegamos a ChatDali
  useEffect(() => {
    if (pendingMessage && (location.pathname === '/chat' || location.pathname === '/Chat') && onBannerMessage) {
      setTimeout(() => {
        onBannerMessage(pendingMessage);
        setPendingMessage(null);
      }, 500);
    }
  }, [location.pathname, pendingMessage, onBannerMessage]);

  const handleBannerAction = (automaticReply: string) => {
    if ((location.pathname === '/chat' || location.pathname === '/Chat') && onBannerMessage) {
      onBannerMessage(automaticReply);
    } else {
      setPendingMessage(automaticReply);
      navigate('/chat');
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background">
        <div className="flex h-20 items-center justify-between px-6">
          <div className="flex items-center md:w-auto">
            {isMobile ? (
              // Versión móvil: solo botón hamburguesa
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-foreground flex-shrink-0"
              >
                <img 
                  src="https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_header_menu_resposive.svg"
                  alt="Menu"
                  className="h-5 w-5"
                />
              </Button>
            ) : (
              // Versión escritorio: Logo de la compañía
              <div className="flex items-center space-x-3">
                <img
                  src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DALILM2.png"
                  alt="Logo Skandia"
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <h1 className="sk-h4 text-foreground">Tu copiloto en Skandia</h1>
                </div>
              </div>
            )}
          </div>

          {/* Banner dinámico en el centro */}
          {isMobile ? (
            <div className="flex-1 mx-2 max-w-full min-w-0">
              <DynamicBanner
                onClose={() => {}}
                onBannerAction={handleBannerAction}
              />
            </div>
          ) : (
            <div className="hidden lg:flex flex-1 justify-center items-center px-4">
              <div className="w-full max-w-2xl mx-auto">
                <DynamicBanner
                  onClose={() => {}}
                  onBannerAction={handleBannerAction}
                />
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <NotificationCenter />
            {!isMobile && <UserProfile />}
          </div>
        </div>
      </header>
    </>
  );
}



