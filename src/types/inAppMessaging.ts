export interface InAppMessage {
  id: string;
  type: 'modal' | 'banner' | 'tooltip';
  mandatory: boolean;
  priority: number;
  title: string;
  body: string;
  cta: {
    label: string;
    action: string;
  };
  frequency: {
    type: 'once_per_user' | 'daily' | 'weekly';
  };
  dismissible: boolean;
}

export interface InAppEvent {
  message_id: string;
  event: 'view' | 'click' | 'dismiss';
  context: string;
  route: string;
}

export interface InAppMessagesParams {
  context: string;
  route?: string;
  app_version?: string;
}
