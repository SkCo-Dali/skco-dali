
import React, { useEffect } from 'react';
import { useSidePanel } from '../hooks/useSidePanel';
import { MobileSidePanel } from './sidepanel/MobileSidePanel';
import { DesktopSidePanel } from './sidepanel/DesktopSidePanel';

interface SidePanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  hasActiveConversation: boolean;
  onBannerMessage: (automaticReply: string) => void;
  onTemplateSelect?: (content: string) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ 
  isOpen, 
  onToggle, 
  onNewChat, 
  hasActiveConversation,
  onBannerMessage,
  onTemplateSelect
}) => {
  const {
    activeView,
    showBanner,
    isMobile,
    handleNewChat,
    handleViewChange,
    handleBannerClose
  } = useSidePanel(onToggle, onNewChat);

  // Función para el banner con logs detallados
  const handleBannerAction = (automaticReply: string) => {
    console.log('🟡🟡🟡 SidePanel: handleBannerAction called with:', automaticReply);
    
    if (onBannerMessage) {
      console.log('🟢🟢🟢 SidePanel: About to call onBannerMessage with:', automaticReply);
      onBannerMessage(automaticReply);
      console.log('🟢🟢🟢 SidePanel: onBannerMessage called successfully');
    } else {
      console.log('🔴🔴🔴 SidePanel: onBannerMessage function is missing!');
    }
    
    // Cerrar sidebar en móvil después de la acción del banner
    if (isMobile) {
      console.log('🟡🟡🟡 SidePanel: Closing sidebar on mobile');
      onToggle();
    }
  };

  const handleTemplateSelect = (content: string) => {
    console.log('🟢🟢🟢 SidePanel: handleTemplateSelect called with:', content);
    console.log('🟢🟢🟢 SidePanel: onTemplateSelect function exists:', !!onTemplateSelect);
    console.log('🟢🟢🟢 SidePanel: onTemplateSelect function type:', typeof onTemplateSelect);
    
    if (onTemplateSelect) {
      console.log('🟢🟢🟢 SidePanel: About to call onTemplateSelect');
      onTemplateSelect(content);
      console.log('🟢🟢🟢 SidePanel: onTemplateSelect called successfully');
    } else {
      console.log('🔴🔴🔴 SidePanel: onTemplateSelect function is missing!');
    }
    
    // Cerrar sidebar después de seleccionar plantilla
    if (isMobile) {
      console.log('🟡🟡🟡 SidePanel: Closing sidebar on mobile after template selection');
      onToggle();
    }
  };

  // Backdrop para móvil
  if (isMobile && isOpen) {
    return (
      <MobileSidePanel 
        onToggle={onToggle}
        activeView={activeView}
        showBanner={showBanner}
        onBannerClose={handleBannerClose}
        onBannerAction={handleBannerAction}
        onViewChange={handleViewChange}
        onNewChat={handleNewChat}
        onTemplateSelect={handleTemplateSelect}
      />
    );
  }

  // Vista desktop
  if (!isMobile && isOpen) {
    return (
      <DesktopSidePanel 
        onToggle={onToggle}
        activeView={activeView}
        showBanner={showBanner}
        onBannerClose={handleBannerClose}
        onBannerAction={handleBannerAction}
        onViewChange={handleViewChange}
        onNewChat={handleNewChat}
        onTemplateSelect={handleTemplateSelect}
      />
    );
  }

  return null;
};
