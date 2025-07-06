
import React from 'react';
import { History, Bookmark, Settings, Plus } from 'lucide-react';
import { Button } from '../ui/button';

interface SidePanelNavigationProps {
  onNewChat: () => void;
  onViewChange: (view: 'main' | 'history' | 'templates' | 'settings') => void;
}

export const SidePanelNavigation: React.FC<SidePanelNavigationProps> = ({
  onNewChat,
  onViewChange
}) => {
  return (
    <div className="p-4 space-y-4">
      <Button 
        onClick={onNewChat}
        className="w-full justify-start bg-green-500 hover:bg-green-600 text-white"
        size="sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nueva Conversación
      </Button>

      <div className="space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-green-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-800"
          onClick={() => onViewChange('history')}
        >
          <History className="h-4 w-4 mr-2" />
          Historial
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-green-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-800"
          onClick={() => onViewChange('templates')}
        >
          <Bookmark className="h-4 w-4 mr-2" />
          Plantillas
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-700 hover:text-green-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-green-400 dark:hover:bg-gray-800"
          onClick={() => onViewChange('settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Configuración
        </Button>
      </div>
    </div>
  );
};
