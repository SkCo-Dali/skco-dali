
import { useState } from 'react';
import { useIsMobile } from './use-mobile';

export const useSidePanel = (onToggle: () => void, onNewChat: () => void) => {
  const [activeView, setActiveView] = useState<'main' | 'history' | 'templates' | 'settings'>('main');
  const [showBanner] = useState(false);
  const isMobile = useIsMobile();

  const handleNewChat = () => {
    onNewChat();
    if (isMobile) {
      onToggle();
    }
  };

  const handleViewChange = (view: 'main' | 'history' | 'templates' | 'settings') => {
    setActiveView(view);
  };

  const handleBannerClose = () => {
    // Banner logic can be implemented here if needed
  };

  return {
    activeView,
    showBanner,
    isMobile,
    handleNewChat,
    handleViewChange,
    handleBannerClose
  };
};
