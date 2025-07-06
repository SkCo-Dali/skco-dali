
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPanel } from './NotificationPanel';

export const NotificationButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount, requestNotificationPermission } = useNotifications();

  // Request notification permission on first click if not already granted
  const handleClick = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await requestNotificationPermission();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className="relative"
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-orange-500' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
};
