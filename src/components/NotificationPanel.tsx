
import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, Bell, Clock, AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  // Auto-cerrar después de 5 segundos cuando se abre
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationBg = (type: string, read: boolean) => {
    const baseClasses = read ? 'opacity-60' : '';
    switch (type) {
      case 'success':
        return `bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 ${baseClasses}`;
      case 'warning':
        return `bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 ${baseClasses}`;
      case 'error':
        return `bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ${baseClasses}`;
      default:
        return `bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ${baseClasses}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:relative md:inset-auto">
      {/* Mobile backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 md:hidden" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700 md:absolute md:top-full md:right-0 md:h-auto md:max-h-96 md:w-80 md:rounded-lg md:border md:shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge variant="default" className="bg-orange-500 hover:bg-orange-600">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="h-full max-h-80 md:max-h-64">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Cargando notificaciones...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${getNotificationBg(notification.type, notification.read)}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium truncate">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full ml-2 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true, 
                          locale: es 
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
