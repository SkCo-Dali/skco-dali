export interface EmailTemplateCategory {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
  isSystem: boolean;
}

export interface EmailTemplateData {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  plainContent: string;
  categoryId: string;
  categoryName?: string;
  isSystem: boolean;
  createdBy?: string;
  createdAt: Date;
  updatedAt?: Date;
  usageCount: number;
  previewImage?: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  subject: string;
  htmlContent: string;
  plainContent: string;
  categoryId: string;
}

export interface UpdateEmailTemplateRequest {
  name?: string;
  subject?: string;
  htmlContent?: string;
  plainContent?: string;
  categoryId?: string;
}

export interface EmailTemplatesResponse {
  templates: EmailTemplateData[];
  categories: EmailTemplateCategory[];
}
