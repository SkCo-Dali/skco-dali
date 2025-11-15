
export interface EmailAttachment {
  filename: string;
  content: string; // base64 encoded
  contentType: string;
}

export interface EmailRecipient {
  LeadId: string;
  Campaign: string;
  to: string;
  subject: string;
  html_content: string;
  plain_content: string;
  attachments?: EmailAttachment[];
}

export interface EmailSendRequest {
  recipients: EmailRecipient[];
}

export interface EmailSendResult {
  to: string;
  status: 'Success' | 'Failed';
  error: string | null;
}

export interface EmailSendResponse {
  message: string;
  results: EmailSendResult[];
}

export interface EmailLog {
  Id: string;
  UserId: string;
  LeadId: string;
  Campaign: string;
  FromEmail: string;
  ToEmail: string;
  Subject: string;
  HtmlContent: string;
  PlainContent: string;
  Status: 'Success' | 'Failed';
  ErrorMessage: string | null;
  CreatedAt: string;
  OpenedAt: string | null;
  OpenedFromIP: string | null;
  OpenedFromUserAgent: string | null;
}

export interface EmailLogsResponse {
  logs: EmailLog[];
}

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  plainContent: string;
}

export interface DynamicField {
  key: string;
  label: string;
  example: string;
}

export interface OutlookSignature {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
}
