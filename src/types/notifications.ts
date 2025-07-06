
export type NotificationType = 
  | 'lead_assigned'
  | 'lead_status_changed'
  | 'follow_up_reminder'
  | 'meeting_scheduled'
  | 'lead_inactive'
  | 'task_pending'
  | 'lead_closed'
  | 'email_update'
  | 'data_error';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  leadId?: string;
  userId: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  notificationTypes: {
    [K in NotificationType]: boolean;
  };
}
