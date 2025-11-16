
export interface EmailAttachment {
  filename: string;
  content_bytes: string; // base64 encoded
  content_type: string;
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

// Log ligero para listado
export interface EmailLog {
  Id: string;
  UserId: string;
  LeadId: string;
  Campaign: string;
  FromEmail: string;
  ToEmail: string;
  Subject: string;
  Status: 'SENT' | 'ERROR';
  ErrorMessage: string | null;
  CreatedAt: string;
  OpenedAt: string | null;
  OpenedFromIP: string | null;
  OpenedFromUserAgent: string | null;
  hasAttachments: boolean;
}

// Respuesta paginada de logs
export interface EmailLogsResponse {
  page: number;
  pageSize: number;
  logs: EmailLog[];
}

// Adjunto del log detallado
export interface EmailLogAttachment {
  fileName: string;
  blobPath: string;
  downloadUrl: string;
}

// Log completo con contenido y adjuntos
export interface EmailLogDetail {
  Id: string;
  UserId: string;
  LeadId: string;
  Campaign: string;
  FromEmail: string;
  ToEmail: string;
  Subject: string;
  HtmlContent: string;
  PlainContent: string;
  Status: 'SENT' | 'ERROR';
  ErrorMessage: string | null;
  CreatedAt: string;
  OpenedAt: string | null;
  OpenedFromIP: string | null;
  OpenedFromUserAgent: string | null;
  AttachmentNames: string | null;
  AttachmentsPath: string | null;
  attachments: EmailLogAttachment[];
}

export interface EmailLogDetailResponse {
  log: EmailLogDetail;
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
