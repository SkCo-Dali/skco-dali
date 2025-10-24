import { UserProfile } from "@/components/UserProfile";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { DynamicBanner } from "@/components/DynamicBanner";

interface HeaderProps {
  onBannerMessage?: (automaticReply: string) => void;
}

export function Header({ onBannerMessage }: HeaderProps = {}) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const handleBannerAction = (automaticReply: string) => {
    if (onBannerMessage) {
      onBannerMessage(automaticReply);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background">
        <div className="flex h-16 md:h-20 items-center justify-between px-2 sm:px-4 md:px-6">
  {/* Botón hamburguesa o logo, pegado a la izquierda */}
  <div className="flex items-center md:w-auto">
    {isMobile ? (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="text-foreground flex-shrink-0 p-1 h-8 w-8"
        style={{ marginLeft: 0 }} // Opcional para asegurar que no haya margen
      >
        <img
          src="https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_header_menu_resposive.svg"
          alt="Menu"
          className="h-5 w-5" // un poco más grande para mejor clic
        />
      </Button>
    ) : (
      <div className="flex items-center space-x-2 md:space-x-3">
        <img
          src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DALILM2.png"
          alt="Logo Skandia"
          className="h-8 md:h-12 w-auto object-contain"
        />
        <div>
          <h1 className="text-sm md:text-base lg:text-lg text-foreground font-medium">Tu copiloto en Skandia</h1>
        </div>
      </div>
    )}
  </div>

  {/* Banner dinámico en el centro, que crezca para ocupar más espacio */}
  {isMobile ? (
    <div className="flex-grow mx-2 md:mx-3 max-w-full min-w-0">
      <DynamicBanner onClose={() => {}} onBannerAction={handleBannerAction} />
    </div>
  ) : (
    <div className="hidden lg:flex flex-grow justify-center items-center px-2 xl:px-4">
      <div className="w-full max-w-4xl mx-auto">
        <DynamicBanner onClose={() => {}} onBannerAction={handleBannerAction} />
      </div>
    </div>
  )}

  {/* Campana de notificaciones a la derecha, sin margen lateral extra */}
  <div className="flex items-center space-x-2 md:space-x-4 pr-2 sm:pr-4 md:pr-6">
    {/*<NotificationCenter />*/}
    {!isMobile && <UserProfile />}
  </div>
</div>

      </header>
    </>
  );
}



