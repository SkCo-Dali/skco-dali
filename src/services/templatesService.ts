
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
    console.log('🔍 TemplatesService: Starting getHeaders() with userIdOverride:', userIdOverride);
    
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
      console.log('🔍 TemplatesService: Starting getUserTemplates');
      console.log('🔍 TemplatesService: Input parameters:', { userEmail, options });
      
      // Get both user templates and system templates with correct headers
      const [userTemplates, systemTemplates] = await Promise.all([
        this.fetchTemplatesByType(userEmail, false, options, userEmail), // User templates with user email
        this.fetchTemplatesByType(userEmail, true, options, 'system')    // System templates with "system" header
      ]);
      
      const allTemplates = [...userTemplates, ...systemTemplates];
      console.log('🔍 TemplatesService: Combined templates result:', {
        userTemplates: userTemplates.length,
        systemTemplates: systemTemplates.length,
        total: allTemplates.length
      });
      
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
      console.log('🔍 TemplatesService: Starting fetchTemplatesByType');
      console.log('🔍 TemplatesService: Parameters:', { userEmail, isDefault, options, userIdOverride });
      
      const params = new URLSearchParams({
        is_default: isDefault.toString(),
        ...(options?.category && { category: options.category }),
        ...(options?.search && { search: options.search }),
        ...(options?.limit && { limit: options.limit.toString() }),
        ...(options?.offset && { offset: options.offset.toString() })
      });

      const fullUrl = `${BACKEND_URL}/api/templates?${params}`;
      console.log('🔍 TemplatesService: Full URL:', fullUrl);
      console.log('🔍 TemplatesService: BACKEND_URL:', BACKEND_URL);
      console.log('🔍 TemplatesService: Query params:', params.toString());

      const headers = await this.getHeaders(userIdOverride);
      console.log('🔍 TemplatesService: Headers to send:', headers);

      console.log('🔍 TemplatesService: Making fetch request...');
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers
      });

      console.log('🔍 TemplatesService: Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
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

      console.log('🔍 TemplatesService: Response OK, reading JSON...');
      const responseData = await response.json();
      console.log('🔍 TemplatesService: Raw response data:', responseData);
      
      // Extract templates array from response object
      const templates = responseData.templates || [];
      console.log('🔍 TemplatesService: Extracted templates array:', templates);
      console.log('🔍 TemplatesService: Templates count:', templates.length);
      
      // Convert from backend format to frontend format
      const convertedTemplates = templates.map((template: any) => {
        const converted = {
          id: template.id,
          name: template.name,
          description: template.description,
          content: template.content,
          category: template.category,
          isDefault: template.isDefault || isDefault,
          createdAt: new Date(template.createdAt),
          usageCount: template.usageCount || 0,
          tags: template.tags || []
        };
        console.log('🔍 TemplatesService: Converted template:', converted);
        return converted;
      });
      
      console.log('🔍 TemplatesService: Final converted templates:', convertedTemplates);
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
      console.log('TemplatesService: Creating template for:', userEmail);
      
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
      console.log('TemplatesService: Template created with ID:', responseData.template_id);
      
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
        
        console.log('TemplatesService: Created template object:', newTemplate);
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
      console.log('TemplatesService: Updating template:', templateId);
      
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
      console.log('TemplatesService: Template updated:', template.id);
      
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
      console.log('TemplatesService: Deleting template:', templateId);
      
      const headers = await this.getHeaders();
      const response = await fetch(`${BACKEND_URL}/api/templates/${templateId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.statusText}`);
      }

      console.log('TemplatesService: Template deleted successfully');
    } catch (error) {
      console.error('TemplatesService: Error deleting template:', error);
      throw error;
    }
  }

  async recordTemplateUsage(userEmail: string, templateId: string): Promise<void> {
    try {
      console.log('TemplatesService: Recording template usage:', templateId);
      
      const headers = await this.getHeaders();
      const response = await fetch(`${BACKEND_URL}/api/templates/${templateId}/usage`, {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to record template usage: ${response.statusText}`);
      }

      console.log('TemplatesService: Template usage recorded');
    } catch (error) {
      console.error('TemplatesService: Error recording template usage:', error);
      // Don't throw error for usage tracking as it's not critical
    }
  }

  async getSystemTemplates(userEmail: string = 'system'): Promise<PromptTemplate[]> {
    try {
      console.log('🔍 TemplatesService: Starting getSystemTemplates for carousel');
      console.log('🔍 TemplatesService: userEmail parameter:', userEmail);
      
      // Get both user templates and system templates for carousel
      const [userTemplates, systemTemplates] = await Promise.all([
        this.fetchTemplatesByType(userEmail, false, { limit: 3 }, userEmail), // User templates with user email
        this.fetchTemplatesByType(userEmail, true, { limit: 3 }, 'system')    // System templates with "system" header
      ]);
      
      // Combine and limit to 6 total templates for carousel
      const allTemplates = [...systemTemplates, ...userTemplates].slice(0, 6);
      
      console.log('🔍 TemplatesService: Carousel templates result:', {
        systemTemplates: systemTemplates.length,
        userTemplates: userTemplates.length,
        total: allTemplates.length
      });
      
      return allTemplates;
    } catch (error) {
      console.error('🔍 TemplatesService: Error getting templates for carousel:', error);
      throw error;
    }
  }

  async getTemplateCategories(userEmail: string): Promise<CategoriesResponse> {
    try {
      console.log('TemplatesService: Getting template categories for:', userEmail);
      
      const headers = await this.getHeaders();
      const response = await fetch(`${BACKEND_URL}/api/templates/categories`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.statusText}`);
      }

      const categories = await response.json();
      console.log('TemplatesService: Received categories:', categories);
      
      return categories;
    } catch (error) {
      console.error('TemplatesService: Error fetching categories:', error);
      throw error;
    }
  }
}

export const templatesService = new TemplatesService();
