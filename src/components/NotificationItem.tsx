
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  TrendingUp, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  CheckSquare, 
  XCircle, 
  Mail, 
  AlertCircle,
  X
} from 'lucide-react';
import { Notification, NotificationType } from '@/types/notifications';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
}

const notificationIcons: Record<NotificationType, any> = {
  lead_assigned: User,
  lead_status_changed: TrendingUp,
  follow_up_reminder: Clock,
  meeting_scheduled: Calendar,
  lead_inactive: AlertTriangle,
  task_pending: CheckSquare,
  lead_closed: XCircle,
  email_update: Mail,
  data_error: AlertCircle,
};

const priorityColors = {
  low: 'border-blue-200',
  medium: 'border-yellow-200',
  high: 'border-orange-200',
  urgent: 'border-red-200',
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);

  const Icon = notificationIcons[notification.type];

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      className={cn(
        "p-3 border-l-4 cursor-pointer transition-colors relative bg-white text-black border-transparent",
        priorityColors[notification.priority],
        "hover:bg-[#3f3f3f] hover:text-white hover:border-[#3f3f3f]"
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-3">
        <div className={cn(
          "flex-shrink-0 p-1 rounded-full",
          notification.priority === 'urgent' ? 'bg-red-100' :
          notification.priority === 'high' ? 'bg-orange-100' :
          notification.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
        )}>
          <Icon className={cn(
            "h-4 w-4",
            notification.priority === 'urgent' ? 'text-red-600' :
            notification.priority === 'high' ? 'text-orange-600' :
            notification.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-sm font-medium truncate",
              notification.read ? 'text-muted-foreground' : 'text-foreground'
            )}>
              {notification.title}
            </p>
            {!notification.read && (
              <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0 ml-2" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), { 
                addSuffix: true, 
                locale: es 
              })}
            </span>
            
            <Badge variant="outline" className="text-xs">
              {notification.priority === 'urgent' ? 'Urgente' :
               notification.priority === 'high' ? 'Alta' :
               notification.priority === 'medium' ? 'Media' : 'Baja'}
            </Badge>
          </div>
        </div>
      </div>

      {isHovered && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 opacity-70 hover:opacity-100"
          onClick={handleDelete}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
