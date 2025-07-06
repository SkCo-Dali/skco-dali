
import React from 'react';
import { SidePanelHeader } from './SidePanelHeader';
import { SidePanelBanner } from './SidePanelBanner';
import { SidePanelContent } from './SidePanelContent';

interface MobileSidePanelProps {
  onToggle: () => void;
  activeView: 'main' | 'history' | 'templates' | 'settings';
  showBanner: boolean;
  onBannerClose: () => void;
  onBannerAction: (automaticReply: string) => void;
  onViewChange: (view: 'main' | 'history' | 'templates' | 'settings') => void;
  onNewChat: () => void;
  onTemplateSelect?: (content: string) => void;
}

export const MobileSidePanel: React.FC<MobileSidePanelProps> = ({
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
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onToggle}
      />
      
      {/* Panel lateral */}
      <div className="fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
        <div className="flex flex-col h-full">
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
      </div>
    </>
  );
};
