
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface NotificationType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  has_amount_threshold: boolean;
  is_active: boolean;
  created_at: string;
}

export interface UserNotificationSetting {
  id: string;
  user_id: string;
  notification_type_id: number;
  is_enabled: boolean;
  minimum_amount: number | null;
  created_at: string;
  updated_at: string;
  notification_type?: NotificationType;
}

// Mock data for notification types
const mockNotificationTypes: NotificationType[] = [
  {
    id: 1,
    code: 'client_withdrawal',
    name: 'Retiros de dinero del cliente',
    description: 'Notificación cuando el cliente realiza un retiro',
    has_amount_threshold: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    code: 'client_deposit',
    name: 'Depósitos del cliente',
    description: 'Notificación cuando el cliente realiza un depósito',
    has_amount_threshold: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    code: 'portfolio_update',
    name: 'Actualizaciones de portafolio',
    description: 'Cambios importantes en el portafolio del cliente',
    has_amount_threshold: false,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [userSettings, setUserSettings] = useState<UserNotificationSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notification types (mock implementation)
  const fetchNotificationTypes = async () => {
    try {
      setNotificationTypes(mockNotificationTypes);
    } catch (error) {
      console.error('Error fetching notification types:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de notificaciones.",
        variant: "destructive"
      });
    }
  };

  // Fetch user notification settings (mock implementation)
  const fetchUserSettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Mock user settings - in real implementation this would come from your backend
      const mockSettings: UserNotificationSetting[] = [];
      setUserSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching user settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones de notificaciones.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get setting for a specific notification type
  const getSettingForType = (typeId: number): UserNotificationSetting | null => {
    return userSettings.find(setting => setting.notification_type_id === typeId) || null;
  };

  // Update or create notification setting (mock implementation)
  const updateNotificationSetting = async (
    typeId: number, 
    isEnabled: boolean, 
    minimumAmount?: number
  ) => {
    if (!user) return;

    try {
      // Mock implementation - in real app this would call your backend API
      const existingSetting = getSettingForType(typeId);
      
      const settingData = {
        id: existingSetting?.id || crypto.randomUUID(),
        user_id: user.id,
        notification_type_id: typeId,
        is_enabled: isEnabled,
        minimum_amount: minimumAmount || null,
        created_at: existingSetting?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (existingSetting) {
        // Update existing setting
        setUserSettings(prev => 
          prev.map(setting => 
            setting.id === existingSetting.id 
              ? { ...setting, ...settingData }
              : setting
          )
        );
      } else {
        // Create new setting
        setUserSettings(prev => [...prev, settingData]);
      }
      
      toast({
        title: "Configuración actualizada",
        description: "La configuración de notificaciones se ha guardado correctamente."
      });
    } catch (error) {
      console.error('Error updating notification setting:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchNotificationTypes();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  return {
    notificationTypes,
    userSettings,
    isLoading,
    getSettingForType,
    updateNotificationSetting,
    refreshSettings: fetchUserSettings
  };
};
