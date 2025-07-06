
export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  isApproved: boolean;
  createdAt: string;
}

export interface WhatsAppUserInfo {
  phoneNumber: string;
  fullName: string;
}

export interface WhatsAppMessage {
  recipientNumber: string;
  content: string;
  recipientName?: string;
}

export interface WhatsAppSendLog {
  id: string;
  recipientNumber: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'delivered' | 'read' | 'pending';
  error?: string;
}

export interface WhatsAppValidationError {
  leadId: string;
  leadName: string;
  phoneNumber: string;
  error: string;
}
