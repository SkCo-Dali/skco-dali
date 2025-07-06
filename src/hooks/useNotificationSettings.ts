
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

export const useNotificationSettings = () => {
  const { user } = useAuth();
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [userSettings, setUserSettings] = useState<UserNotificationSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notification types
  const fetchNotificationTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setNotificationTypes(data || []);
    } catch (error) {
      console.error('Error fetching notification types:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de notificaciones.",
        variant: "destructive"
      });
    }
  };

  // Fetch user notification settings
  const fetchUserSettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select(`
          *,
          notification_type:notification_types(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserSettings(data || []);
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

  // Update or create notification setting
  const updateNotificationSetting = async (
    typeId: number, 
    isEnabled: boolean, 
    minimumAmount?: number
  ) => {
    if (!user) return;

    try {
      const existingSetting = getSettingForType(typeId);

      const settingData = {
        user_id: user.id,
        notification_type_id: typeId,
        is_enabled: isEnabled,
        minimum_amount: minimumAmount || null
      };

      if (existingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from('user_notification_settings')
          .update({
            is_enabled: isEnabled,
            minimum_amount: minimumAmount || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSetting.id);

        if (error) throw error;
      } else {
        // Create new setting
        const { error } = await supabase
          .from('user_notification_settings')
          .insert(settingData);

        if (error) throw error;
      }

      // Refresh settings
      await fetchUserSettings();
      
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
