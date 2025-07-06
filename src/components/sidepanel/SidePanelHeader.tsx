
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface SidePanelHeaderProps {
  onToggle: () => void;
}

export const SidePanelHeader: React.FC<SidePanelHeaderProps> = ({ onToggle }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menú</h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};
