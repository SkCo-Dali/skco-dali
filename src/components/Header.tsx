import { UserProfile } from "@/components/UserProfile";
import { NotificationCenter } from "@/components/NotificationCenter";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
  onSamiToggle?: () => void;
}

export function Header({ onSamiToggle }: HeaderProps = {}) {
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const { user } = useAuth();

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
                style={{ marginLeft: 0 }}
              >
                <img
                  src="https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_header_menu_resposive.svg"
                  alt="Menu"
                  className="h-5 w-5"
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
                  <h1 className="text-sm md:text-base lg:text-lg text-foreground font-medium"></h1>
                </div>
              </div>
            )}
          </div>

          {/* Espacio central vacío */}
          <div className="flex-1"></div>

          {/* Perfil de usuario, saludo y botón Tu Sami */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {!isMobile && <UserProfile />}
            {!isMobile && user && (
              <div className="text-sm font-medium text-foreground">
                <span>Hola, </span>
                <span className="text-[#00A859]">{user.preferredName || user.name || "Usuario"}</span>
                <span> 👋</span>
              </div>
            )}
            <Button
              onClick={onSamiToggle}
              variant="ghost"
              className="flex items-center gap-2 h-10 px-3 rounded-full bg-[#e8f5e9] hover:bg-[#d4eed6] transition-colors"
              id="tu-sami-button"
            >
              <img
                src="https://skcoblobresources.blob.core.windows.net/digital-assets/animations/sk-sami-contigo.gif"
                alt="Sami"
                className="w-6 h-6"
              />
              <span className="text-sm font-medium text-foreground hidden md:inline">Tu Sami</span>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
