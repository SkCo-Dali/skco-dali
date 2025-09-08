
import { Link, useLocation } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { useState } from "react";
import { ChevronDown, ChevronRight, Search, FileText } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { getRolePermissions } from "@/types/crm";
import { ConversationHistoryModal } from "@/components/ConversationHistoryModal";
import { PromptTemplates } from "@/components/PromptTemplates";

interface AppSidebarProps {
  onTemplateSelect?: (content: string) => void;
}

const allMenuItems = [
  { title: "Inicio", url: "/index", iconClass: "", page: "index", customIcon: "https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_casa_p.svg" },
  { title: "Leads", url: "/leads", iconClass: "", page: "leads", customIcon: "https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_profile_1_p.svg" },
  { title: "Market Dali", url: "/oportunidades", iconClass: "", page: "opportunities", customIcon: "https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_maletin_1_p.svg" },
  { title: "Chat Dali", url: "/Chat", iconClass: "", page: "ChatDali", customIcon: "https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_globo_p.svg"},
  { title: "Gamificación", url: "/gamification", iconClass: "", page: "gamification", customIcon: "https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_trofeo_p.svg" },
  { title: "Dashboard", url: "/reports", iconClass: "", page: "reports", customIcon: "https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_grafica_1_n.svg" },
  { title: "Informes", url: "/informes", iconClass: "", page: "informes", customIcon: "https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_chart_2_p.svg" },
  { title: "Calendario", url: "/calendar", iconClass: "", page: "calendar", customIcon: "https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_calendario_p.svg" },
  { title: "Tareas", url: "/tasks", iconClass: "", page: "tasks", customIcon: "https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_puntos_p.svg" },
];

const allAdminItems = [
  { title: "Gestión de Usuarios", url: "/admin/users", iconClass: "", page: "users", customIcon: "https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_grupo_1_p.svg" },
  { title: "Configuración", url: "/admin/settings", iconClass: "typcn typcn-cog", page: "settings" },
];

export function AppSidebar({ onTemplateSelect }: AppSidebarProps) {
  const location = useLocation();
  const { state, isMobile, openMobile, setOpenMobile, toggleSidebar } = useSidebar();
  const isMobileDevice = useIsMobile();
  const { user } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  const permissions = user ? getRolePermissions(user.role) : null;

  const menuItems = allMenuItems.filter(item =>
    permissions?.accessiblePages.includes(item.page)
  );

  const adminItems = allAdminItems.filter(item =>
    permissions?.accessiblePages.includes(item.page)
  );

  const showText = isMobile ? openMobile : state === "expanded";
  const showLogo = isMobile ? openMobile : state === "expanded";

  const handleItemClick = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
  };

  const handleSelectTemplate = (content: string) => {
    console.log('Template selected:', content);
    
    // Close the templates modal
    setShowTemplatesModal(false);
    
    // If we have a callback to send the template content, use it
    if (onTemplateSelect) {
      onTemplateSelect(content);
    }
  };

  return (
    <>
      <Sidebar collapsible="icon" className="border-r mt-16 shadow-md" style={{ borderColor: "#ffffff" }}>
        <div className="bg-[#ffffff] h-full flex flex-col">
          <SidebarHeader className="p-4">
            <div
              className={`flex items-center ${
                isMobileDevice && openMobile
                  ? "justify-between"
                  : !isMobileDevice && state === "collapsed"
                  ? "justify-center"
                  : "justify-between"
              }`}
            >
              {isMobileDevice && openMobile ? (
                <>
                  <div className="flex items-center space-x-3">
                    <UserProfile />
                    <div className="text-accent">
                      <div className="text-sm font-medium">
                        Hola, {user?.name?.split(" ")[2] || "Usuario"}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="text-primary hover:bg-transparent"
                  >
                    <img 
                      src="https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_header_menu_resposive.svg"
                      alt="Menu"
                      className="h-5 w-5"
                    />
                  </Button>
                </>
              ) : (
                <>
                  {showText && !isMobileDevice && (
                    <div className="text-accent">
                      <div className="text-sm font-medium">
                        Hola, {user?.name?.split(" ")[2] || "Usuario"}
                      </div>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="text-primary hover:bg-transparent flex-shrink-0 p-0 m-0"
                  >
                    <img 
                      src="https://skcoblobresources.blob.core.windows.net/digital-assets/icons/icon-skandia/sk_header_menu_resposive.svg"
                      alt="Menu"
                      className="h-5 w-5 opacity-100"
                    />
                  </Button>
                </>
              )}
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 flex flex-col justify-between pt-4">
            <div>
              <SidebarGroup>
                {showText && (
                  <SidebarGroupLabel className="text-black/80">Menú Principal</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={location.pathname === item.url}
                          className={`w-full justify-start transition-colors hover:bg-transparent ${
                            location.pathname === item.url
                              ? "bg-white text-black data-[active=true]:bg-white data-[active=true]:text-black"
                              : "text-black"
                          } ${!showText ? "justify-center" : ""}`}
                          tooltip={!showText ? item.title : undefined}
                        >
                          <Link
                            to={item.url}
                            className={`flex items-center ${!showText ? "justify-center" : "space-x-3"} text-black`}
                            onClick={handleItemClick}
                          >
                            {item.customIcon ? (
                              <img 
                                src={item.customIcon} 
                                alt={item.title}
                                className="w-5 h-5"
                              />
                            ) : (
                              <i className={`${item.iconClass} text-lg`} aria-hidden="true" />
                            )}
                            {showText && <span>{item.title}</span>}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {adminItems.length > 0 && (
                <SidebarGroup>
                  {showText && (
                    <SidebarGroupLabel className="text-black/80">Administración</SidebarGroupLabel>
                  )}
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {adminItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={location.pathname === item.url}
                            className={`w-full justify-start transition-colors hover:bg-transparent ${
                              location.pathname === item.url
                                ? "bg-white text-black data-[active=true]:bg-white data-[active=true]:text-black"
                                : "text-black"
                            } ${!showText ? "justify-center" : ""}`}
                            tooltip={!showText ? item.title : undefined}
                          >
                            <Link
                              to={item.url}
                              className={`flex items-center ${!showText ? "justify-center" : "space-x-3"} text-black`}
                              onClick={handleItemClick}
                            >
                              {item.customIcon ? (
                              <img 
                                src={item.customIcon} 
                                alt={item.title}
                                className="w-5 h-5"
                              />
                            ) : (
                              <i className={`${item.iconClass} text-lg`} aria-hidden="true" />
                            )}
                            {showText && <span>{item.title}</span>}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </div>

            {showLogo && (
              <div className="flex justify-center mt-4 mb-4">
                <img
                  src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DALILM.png"
                  alt="Logo Skandia"
                  className="w-24 object-contain"
                />
              </div>
            )}
          </SidebarContent>
        </div>
      </Sidebar>

      {/* Modal para el historial de conversaciones */}
      <ConversationHistoryModal 
        isOpen={showConversationModal}
        onClose={() => setShowConversationModal(false)}
      />

      {/* Modal para las plantillas */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-[90vw] max-w-4xl h-[80vh] overflow-hidden">
            <PromptTemplates
              onSelectTemplate={handleSelectTemplate}
              onClose={() => setShowTemplatesModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
