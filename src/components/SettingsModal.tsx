
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NotificationSettings } from './NotificationSettings';
import { Bell, Settings, User, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'notifications' | 'profile' | 'security' | 'general';

const tabs: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
  { id: 'notifications', label: 'Notificaciones', icon: <Bell className="h-4 w-4" /> },
  { id: 'profile', label: 'Perfil', icon: <User className="h-4 w-4" /> },
  { id: 'security', label: 'Seguridad', icon: <Shield className="h-4 w-4" /> },
  { id: 'general', label: 'General', icon: <Settings className="h-4 w-4" /> },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationSettings />;
      case 'profile':
        return (
          <div className="p-8 text-center text-gray-500">
            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Configuración de perfil próximamente</p>
          </div>
        );
      case 'security':
        return (
          <div className="p-8 text-center text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Configuración de seguridad próximamente</p>
          </div>
        );
      case 'general':
        return (
          <div className="p-8 text-center text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Configuración general próximamente</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Configuración</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with tabs */}
          <div className="w-64 border-r bg-gray-50 dark:bg-gray-800/50">
            <div className="p-4 space-y-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
