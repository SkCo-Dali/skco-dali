export interface EmailTemplateCategory {
  category: string;
}

export interface EmailTemplateData {
  id: string;
  template_name: string;
  category: string;
  subject: string;
  html_content: string;
  plain_text_content: string | null;
  is_system_template: boolean;
  is_active: boolean;
  owner_email: string | null;
  created_at: string;
  updated_at: string;
  type: 'own' | 'system';
}

export interface CreateEmailTemplateRequest {
  template_name: string;
  category?: string;
  subject: string;
  html_content: string;
  plain_text_content?: string | null;
}

export interface UpdateEmailTemplateRequest {
  template_name?: string;
  category?: string;
  subject?: string;
  html_content?: string;
  plain_text_content?: string | null;
  is_active?: boolean;
}
