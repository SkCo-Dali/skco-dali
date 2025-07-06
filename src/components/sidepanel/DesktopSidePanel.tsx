
import React from 'react';
import { SidePanelHeader } from './SidePanelHeader';
import { SidePanelBanner } from './SidePanelBanner';
import { SidePanelContent } from './SidePanelContent';

interface DesktopSidePanelProps {
  onToggle: () => void;
  activeView: 'main' | 'history' | 'templates' | 'settings';
  showBanner: boolean;
  onBannerClose: () => void;
  onBannerAction: (automaticReply: string) => void;
  onViewChange: (view: 'main' | 'history' | 'templates' | 'settings') => void;
  onNewChat: () => void;
  onTemplateSelect?: (content: string) => void;
}

export const DesktopSidePanel: React.FC<DesktopSidePanelProps> = ({
  onToggle,
  activeView,
  showBanner,
  onBannerClose,
  onBannerAction,
  onViewChange,
  onNewChat,
  onTemplateSelect
}) => {
  return (
    <div className="w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <SidePanelHeader onToggle={onToggle} />

      {activeView === 'main' && (
        <SidePanelBanner 
          showBanner={showBanner}
          onBannerClose={onBannerClose}
          onBannerAction={onBannerAction}
        />
      )}

      <SidePanelContent 
        activeView={activeView}
        onViewChange={onViewChange}
        onNewChat={onNewChat}
        onTemplateSelect={onTemplateSelect}
      />
    </div>
  );
};
