
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  };

  // Show browser notification
  const showBrowserNotification = (title: string, message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: 'dali-ai-notification'
      });
    }
  };

  // Fetch notifications (mock implementation)
  const fetchNotifications = async () => {
    if (!user) {
      console.log('No user found, skipping notifications fetch');
      return;
    }
    
    console.log('Fetching notifications for user:', user.id);
    
    setIsLoading(true);
    try {
      // Mock notifications - in real implementation this would come from your backend
      const mockNotifications: Notification[] = [
        {
          id: '1',
          user_id: user.id,
          title: 'Bienvenido',
          message: 'Bienvenido al sistema CRM',
          type: 'info',
          read: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      console.log('Notifications fetched successfully:', mockNotifications.length);
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.log('Error fetching notifications (silently handled):', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      // Mock implementation - in real app this would call your backend API
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.log('Error marking notification as read (silently handled):', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // Mock implementation - in real app this would call your backend API
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.log('Error marking all notifications as read (silently handled):', error);
    }
  };

  // Create a new notification (mock implementation)
  const createNotification = async (title: string, message: string, type: Notification['type'] = 'info') => {
    if (!user) return;

    try {
      const newNotification: Notification = {
        id: crypto.randomUUID(),
        user_id: user.id,
        title,
        message,
        type,
        read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Only show browser notification, no toast popup
      showBrowserNotification(title, message);
      
      return newNotification;
    } catch (error) {
      console.log('Error creating notification (silently handled):', error);
      throw error;
    }
  };

  // Initialize notifications
  useEffect(() => {
    if (!user) return;

    if ('Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }

    fetchNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    requestNotificationPermission,
    showBrowserNotification
  };
};
