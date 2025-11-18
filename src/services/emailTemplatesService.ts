import { ENV } from '@/config/environment';
import {
  EmailTemplateData,
  EmailTemplateCategory,
  CreateEmailTemplateRequest,
  UpdateEmailTemplateRequest,
} from '@/types/emailTemplates';

class EmailTemplatesService {
  private baseUrl = ENV.CRM_API_BASE_URL;

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Obtiene todas las plantillas (propias y del sistema)
   */
  async getTemplates(filters?: {
    search?: string;
    category?: string;
    template_type?: 'all' | 'own' | 'system';
    include_inactive?: boolean;
  }): Promise<EmailTemplateData[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.template_type) params.append('template_type', filters.template_type);
    if (filters?.include_inactive !== undefined) {
      params.append('include_inactive', String(filters.include_inactive));
    }

    const response = await fetch(`${this.baseUrl}/api/email-templates?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener plantillas de correo');
    }

    return response.json();
  }

  /**
   * Obtiene una plantilla por ID
   */
  async getTemplateById(id: string): Promise<EmailTemplateData> {
    const response = await fetch(`${this.baseUrl}/api/email-templates/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener plantilla de correo');
    }

    return response.json();
  }

  /**
   * Crea una nueva plantilla
   */
  async createTemplate(data: CreateEmailTemplateRequest): Promise<EmailTemplateData> {
    const response = await fetch(`${this.baseUrl}/api/email-templates`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al crear plantilla de correo');
    }

    return response.json();
  }

  /**
   * Actualiza una plantilla existente
   */
  async updateTemplate(id: string, data: UpdateEmailTemplateRequest): Promise<EmailTemplateData> {
    const response = await fetch(`${this.baseUrl}/api/email-templates/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar plantilla de correo');
    }

    return response.json();
  }

  /**
   * Elimina una plantilla (solo propias, no del sistema)
   */
  async deleteTemplate(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/email-templates/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al eliminar plantilla de correo');
    }
  }

  /**
   * Obtiene todas las categorías disponibles
   */
  async getCategories(): Promise<EmailTemplateCategory[]> {
    const response = await fetch(`${this.baseUrl}/api/email-templates/categories/list`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener categorías');
    }

    return response.json();
  }
}

export const emailTemplatesService = new EmailTemplatesService();
