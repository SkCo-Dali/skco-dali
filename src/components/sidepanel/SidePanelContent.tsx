
import React from 'react';
import { ConversationHistory } from '../ConversationHistory';
import { SettingsModal } from '../SettingsModal';
import { SidePanelNavigation } from './SidePanelNavigation';
import { PromptTemplates } from '../PromptTemplates';

interface SidePanelContentProps {
  activeView: 'main' | 'history' | 'templates' | 'settings';
  onViewChange: (view: 'main' | 'history' | 'templates' | 'settings') => void;
  onNewChat: () => void;
  onTemplateSelect?: (content: string) => void;
}

export const SidePanelContent: React.FC<SidePanelContentProps> = ({
  activeView,
  onViewChange,
  onNewChat,
  onTemplateSelect
}) => {
  return (
    <div className="flex-1 overflow-hidden">
      {activeView === 'main' && (
        <SidePanelNavigation 
          onNewChat={onNewChat}
          onViewChange={onViewChange}
        />
      )}

      {activeView === 'history' && (
        <div className="h-full">
          <ConversationHistory onClose={() => onViewChange('main')} />
        </div>
      )}

      {activeView === 'templates' && (
        <div className="h-full">
          <PromptTemplates 
            onSelectTemplate={onTemplateSelect || (() => {})}
            onClose={() => onViewChange('main')} 
          />
        </div>
      )}

      {activeView === 'settings' && (
        <div className="p-4">
          <SettingsModal 
            isOpen={true} 
            onClose={() => onViewChange('main')} 
          />
        </div>
      )}
    </div>
  );
};
