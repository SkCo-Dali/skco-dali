
import { PromptTemplate } from '../types/templates';
import { ENV } from '@/config/environment';

const BACKEND_URL = ENV.TEMPLATES_API_BASE_URL;

export interface CreateTemplateRequest {
  name: string;
  description: string;
  content: string;
  category: string;
  tags?: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface TemplateCategory {
  category: string;
  count: number;
}

export interface CategoriesResponse {
  user_id: string;
  categories: TemplateCategory[];
}

class TemplatesService {
  private baseUrl = ENV.AI_API_BASE_URL;

  private async getHeaders(userIdOverride?: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    return headers;
  }

  async getUserTemplates(userEmail: string, options?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<PromptTemplate[]> {
    try {
      // Get both user templates and system templates with correct headers
      const [userTemplates, systemTemplates] = await Promise.all([
        this.fetchTemplatesByType(userEmail, false, options, userEmail), // User templates with user email
        this.fetchTemplatesByType(userEmail, true, options, 'system')    // System templates with "system" header
      ]);
      
      const allTemplates = [...userTemplates, ...systemTemplates];
      return allTemplates;
    } catch (error) {
      console.error('🔍 TemplatesService: Error in getUserTemplates:', error);
      throw error;
    }
  }

  private async fetchTemplatesByType(
    userEmail: string, 
    isDefault: boolean, 
    options?: {
      category?: string;
      search?: string;
      limit?: number;
      offset?: number;
    },
    userIdOverride?: string
  ): Promise<PromptTemplate[]> {
    try {
      const params = new URLSearchParams({
        is_default: isDefault.toString(),
        ...(options?.category && { category: options.category }),
        ...(options?.search && { search: options.search }),
        ...(options?.limit && { limit: options.limit.toString() }),
        ...(options?.offset && { offset: options.offset.toString() })
      });

      const fullUrl = `${BACKEND_URL}/api/templates?${params}`;
      const headers = await this.getHeaders(userIdOverride);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        console.error('🔍 TemplatesService: Response not OK');
        
        let errorData;
        try {
          errorData = await response.json();
          console.error('🔍 TemplatesService: Error response body:', errorData);
        } catch (parseError) {
          console.error('🔍 TemplatesService: Could not parse error response:', parseError);
          const textResponse = await response.text();
          console.error('🔍 TemplatesService: Error response text:', textResponse);
        }
        
        throw new Error(`Failed to fetch ${isDefault ? 'system' : 'user'} templates: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      const templates = responseData.templates || [];
      
      // Convert from backend format to frontend format
      const convertedTemplates = templates.map((template: any) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category,
        isDefault: template.isDefault || isDefault,
        createdAt: new Date(template.createdAt),
        usageCount: template.usageCount || 0,
        tags: template.tags || []
      }));
      
      return convertedTemplates;
    } catch (error) {
      console.error('🔍 TemplatesService: Error in fetchTemplatesByType:', error);
      console.error('🔍 TemplatesService: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      // Return empty array instead of throwing to allow partial success
      return [];
    }
  }

  async createTemplate(userEmail: string, templateData: CreateTemplateRequest): Promise<PromptTemplate> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${BACKEND_URL}/api/templates`, {
        method: 'POST',
        headers,
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create template: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Build the template object directly from the request data and response
      if (responseData.template_id) {
        const newTemplate: PromptTemplate = {
          id: responseData.template_id,
          name: templateData.name,
          description: templateData.description,
          content: templateData.content,
          category: templateData.category,
          isDefault: false,
          createdAt: new Date(),
          usageCount: 0,
          tags: templateData.tags || []
        };
        
        return newTemplate;
      } else {
        throw new Error('No template ID returned from creation');
      }
    } catch (error) {
      console.error('TemplatesService: Error creating template:', error);
      throw error;
    }
  }

  async updateTemplate(userEmail: string, templateId: string, templateData: UpdateTemplateRequest): Promise<PromptTemplate> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${BACKEND_URL}/api/templates/${templateId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(templateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update template: ${response.statusText}`);
      }

      const template = await response.json();
      
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        content: template.content,
        category: template.category,
        isDefault: template.isDefault || false,
        createdAt: new Date(template.createdAt),
        usageCount: template.usageCount || 0,
        tags: template.tags || []
      };
    } catch (error) {
      console.error('TemplatesService: Error updating template:', error);
      throw error;
    }
  }

  async deleteTemplate(userEmail: string, templateId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${BACKEND_URL}/api/templates/${templateId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }
    } catch (error) {
      console.error('TemplatesService: Error deleting template:', error);
      throw error;
    }
  }

  async recordTemplateUsage(userEmail: string, templateId: string): Promise<void> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${BACKEND_URL}/api/templates/${templateId}/usage`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to record template usage: ${response.statusText}`);
      }
    } catch (error) {
      console.error('TemplatesService: Error recording template usage:', error);
      // Don't throw error for usage tracking as it's not critical
    }
  }

  async getSystemTemplates(userEmail: string = 'system'): Promise<PromptTemplate[]> {
    try {
      // Get both user templates and system templates for carousel
      const [userTemplates, systemTemplates] = await Promise.all([
        this.fetchTemplatesByType(userEmail, false, { limit: 3 }, userEmail), // User templates with user email
        this.fetchTemplatesByType(userEmail, true, { limit: 3 }, 'system')    // System templates with "system" header
      ]);
      
      // Combine and limit to 6 total templates for carousel
      const allTemplates = [...systemTemplates, ...userTemplates].slice(0, 6);
      return allTemplates;
    } catch (error) {
      console.error('🔍 TemplatesService: Error getting templates for carousel:', error);
      throw error;
    }
  }

  async getTemplateCategories(userEmail: string): Promise<CategoriesResponse> {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${BACKEND_URL}/api/templates/categories`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const categories = await response.json();
      return categories;
    } catch (error) {
      console.error('TemplatesService: Error fetching categories:', error);
      throw error;
    }
  }
}

export const templatesService = new TemplatesService();
