import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification, NotificationType, NotificationPriority } from '@/types/notifications';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>) => {
    if (!user) return;

    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      read: false,
      userId: user.id
    };

    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Simular algunas notificaciones de ejemplo al cargar
  useEffect(() => {
    if (user && notifications.length === 0) {
      const mockNotifications: Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>[] = [
        {
          type: 'lead_assigned',
          title: 'Nuevo lead asignado',
          message: 'Se te ha asignado un nuevo lead: Maria García',
          priority: 'high',
          leadId: '1',
          actionUrl: '/leads'
        },
        {
          type: 'follow_up_reminder',
          title: 'Recordatorio de seguimiento',
          message: 'Es hora de hacer seguimiento con Lead 2',
          priority: 'medium',
          leadId: '2',
          actionUrl: '/leads'
        },
        {
          type: 'lead_status_changed',
          title: 'Cambio de estado',
          message: 'Lead 3 cambió de "Contactado" a "Calificado"',
          priority: 'medium',
          leadId: '3',
          actionUrl: '/leads'
        }
      ];

      setTimeout(() => {
        mockNotifications.forEach(notif => addNotification(notif));
      }, 1000);
    }
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
