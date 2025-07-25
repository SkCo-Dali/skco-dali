import { Conversation, ConversationSummary } from '../types/conversation';
import { ChatMessage } from '../types/chat';
import { ENV } from '@/config/environment';

const API_BASE_URL = `${ENV.AI_API_BASE_URL}/api`;

// Helper function to get authorization headers with Entra ID token
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // Get the Entra ID token from SecureTokenManager
    const { default: SecureTokenManager } = await import('@/utils/secureTokenManager');
    const tokenData = SecureTokenManager.getToken();
    
    if (tokenData && tokenData.token) {
      // Use the Entra ID token (idToken) for authorization
      headers['Authorization'] = `Bearer ${tokenData.token}`;
      console.log('🔑 Authorization header added with Entra ID token');
    } else {
      console.warn('⚠️ No Entra ID token available for API authorization');
    }
  } catch (error) {
    console.warn('⚠️ Could not get Entra ID token for API request:', error);
  }

  return headers;
};

export interface AzureConversation {
  id: string;
  userId: string;
  title: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    // Add support for structured data
    data?: Array<Record<string, any>>;
    chart?: {
      type: 'bar' | 'line' | 'pie' | 'area';
      data: Array<Record<string, any>>;
      xAxis?: string;
      yAxis?: string;
    };
    downloadLink?: {
      url: string;
      filename: string;
    };
    videoPreview?: {
      url: string;
      title: string;
      thumbnail?: string;
      duration?: string;
      platform?: string;
    };
    files?: Array<{
      name: string;
      size: number;
      type: string;
      url?: string;
    }>;
    metadata?: {
      processingTime: number;
      model: string;
      tokensUsed: number;
    };
    deviceInfo?: {
      userAgent?: string;
      platform?: string;
      deviceType?: 'mobile' | 'tablet' | 'desktop';
      browserName?: string;
      browserVersion?: string;
      operatingSystem?: string;
      screenResolution?: string;
      language?: string;
      timezone?: string;
      ipAddress?: string;
      location?: {
        latitude?: number;
        longitude?: number;
        city?: string;
        country?: string;
        accuracy?: number;
      };
    };
  }>;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  isArchived: boolean;
  totalTokens: number;
  attachments: string[];
}

export interface AzureFileInfo {
  fileName: string;
  url: string;
  uploaded_by: string;
  uploaded_at: string;
}

// Interface for the API response that wraps conversations in an object
interface ListConversationsResponse {
  conversations: AzureConversation[];
}

export class AzureConversationService {
  
  // Crear nueva conversación
  async createConversation(userId: string, title: string): Promise<string> {
    const endpoint = `${API_BASE_URL}/conversations`;
    
    // Generate unique conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const requestBody = {
      id: conversationId,
      userId,
      title,
      messages: [],
      createdAt: now,
      updatedAt: now,
      tags: [],
      isArchived: false,
      totalTokens: 0,
      attachments: []
    };

    console.log('🚀 AZURE API REQUEST - CREATE CONVERSATION');
    console.log('📍 Endpoint:', endpoint);
    console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('🆔 Generated Conversation ID:', conversationId);
    console.log('👤 User ID:', userId);
    console.log('📝 Title:', title);
    console.log('⏰ Created/Updated At:', now);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('📈 Response Status:', response.status);
      console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response Error Text:', errorText);
        throw new Error(`Failed to create conversation: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🎉 SUCCESS Response Body:', JSON.stringify(result, null, 2));
      console.log('🆔 Created Conversation ID:', result.id);

      return result.id || conversationId;
    } catch (error) {
      console.error('💥 AZURE API ERROR - CREATE CONVERSATION:', error);
      console.error('🔍 Error Type:', typeof error);
      console.error('📝 Error Message:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network Error: Unable to connect to Azure API');
        console.error('🔗 Check if the endpoint is accessible:', endpoint);
      }
      
      throw error;
    }
  }

  // Obtener conversación por ID - FIXED ENDPOINT URL
  async getConversation(conversationId: string, userEmail: string): Promise<AzureConversation | null> {
    const endpoint = `${API_BASE_URL}/conversations/${conversationId}?user_id=${encodeURIComponent(userEmail)}`;
    
    console.log('🚀 AZURE API REQUEST - GET CONVERSATION');
    console.log('📍 Endpoint:', endpoint);
    console.log('🆔 Conversation ID:', conversationId);
    console.log('👤 User Email:', userEmail);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(endpoint, { headers });
      
      console.log('📈 Response Status:', response.status);
      console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📭 Conversation not found (404)');
          return null;
        }
        const errorText = await response.text();
        console.error('❌ Response Error Text:', errorText);
        throw new Error(`Failed to get conversation: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🎉 SUCCESS Response Body:', JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error('💥 AZURE API ERROR - GET CONVERSATION:', error);
      console.error('🔍 Error Type:', typeof error);
      console.error('📝 Error Message:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }

  // Listar conversaciones de un usuario - UPDATED to not send userEmail in URL
  async listUserConversations(userEmail: string): Promise<AzureConversation[]> {
    const endpoint = `${API_BASE_URL}/listconversations`;
    
    console.log('🚀 AZURE API REQUEST - LIST CONVERSATIONS');
    console.log('📍 Endpoint:', endpoint);
    console.log('👤 User Email (from token):', userEmail);
    console.log('🔗 Method: GET');
    console.log('📦 Body: None (GET request)');
    console.log('🔑 User email will be obtained from Authorization header token');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(endpoint, {
        method: 'GET',
        headers
      });
      
      console.log('📈 Response Status:', response.status);
      console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response Error Text:', errorText);
        throw new Error(`Failed to list conversations: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result: ListConversationsResponse = await response.json();
      console.log('🎉 SUCCESS Response Body:', JSON.stringify(result, null, 2));
      console.log('🔍 Response type:', typeof result);
      console.log('🔍 Is object with conversations property:', result && typeof result === 'object' && 'conversations' in result);
      
      // Handle the correct API response format
      if (result && typeof result === 'object' && 'conversations' in result && Array.isArray(result.conversations)) {
        console.log('📊 Number of conversations in response:', result.conversations.length);
        console.log('✅ Successfully extracted conversations array from response object');
        return result.conversations;
      } else {
        console.warn('⚠️ API response does not have expected format with conversations property');
        console.warn('🔍 Actual response structure:', Object.keys(result || {}));
        return [];
      }
    } catch (error) {
      console.error('💥 AZURE API ERROR - LIST CONVERSATIONS:', error);
      console.error('🔍 Error Type:', typeof error);
      console.error('📝 Error Message:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network Error: Unable to connect to Azure API');
        console.error('🔗 Check if the endpoint is accessible:', endpoint);
      }
      
      throw error;
    }
  }

  // Actualizar conversación
  async updateConversation(conversationId: string, userEmail: string, conversation: Partial<AzureConversation>): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}?user_id=${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(conversation)
      });

      if (!response.ok) {
        throw new Error(`Failed to update conversation: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error updating conversation:', error);
      throw error;
    }
  }

  // Eliminar conversación
  async deleteConversation(conversationId: string, userEmail: string): Promise<void> {
    const endpoint = `${API_BASE_URL}/conversations/${conversationId}?user_id=${encodeURIComponent(userEmail)}`;
    
    console.log('🚀 AZURE API REQUEST - DELETE CONVERSATION');
    console.log('📍 Endpoint:', endpoint);
    console.log('🆔 Conversation ID:', conversationId);
    console.log('👤 User Email:', userEmail);
    console.log('🔗 Method: DELETE');

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers
      });

      console.log('📈 Response Status:', response.status);
      console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response Error Text:', errorText);
        throw new Error(`Failed to delete conversation: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.text();
      console.log('🎉 SUCCESS Response Body:', result);
      console.log('✅ Conversation deleted successfully');

    } catch (error) {
      console.error('💥 AZURE API ERROR - DELETE CONVERSATION:', error);
      console.error('🔍 Error Type:', typeof error);
      console.error('📝 Error Message:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network Error: Unable to connect to Azure API');
        console.error('🔗 Check if the endpoint is accessible:', endpoint);
      }
      
      throw error;
    }
  }

  // Subir archivo
  async uploadFile(file: File, userEmail: string, conversationId: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_email', userEmail);
      formData.append('conversation_id', conversationId);

      const authHeaders = await getAuthHeaders();
      // Don't include Content-Type for FormData, let browser set it
      const headers: Record<string, string> = {};
      if (authHeaders['Authorization']) {
        headers['Authorization'] = authHeaders['Authorization'];
        console.log('🔑 File upload with Entra ID authorization');
      }

      const response = await fetch(`${API_BASE_URL}/files/upload`, {
        method: 'POST',
        headers,
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Failed to upload file: ${response.statusText}`);
      }

      const result = await response.json();
      return result.fileName || result.blob_id;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Obtener archivos de una conversación
  async getConversationFiles(conversationId: string, userEmail: string): Promise<AzureFileInfo[]> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/files/conversation/${conversationId}?user_email=${encodeURIComponent(userEmail)}`, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to get conversation files: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting conversation files:', error);
      return [];
    }
  }

  // Obtener URL de descarga de archivo
  async getFileDownloadUrl(blobId: string): Promise<string> {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/files/${blobId}`, { headers });
      
      if (!response.ok) {
        throw new Error(`Failed to get file download URL: ${response.statusText}`);
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Error getting file download URL:', error);
      throw error;
    }
  }

  // Obtener banners del usuario
  async getUserBanners(userEmail: string): Promise<any[]> {
    const endpoint = `${API_BASE_URL}/banner/${encodeURIComponent(userEmail)}`;
    
    console.log('🚀 AZURE API REQUEST - GET USER BANNERS');
    console.log('📍 Endpoint:', endpoint);
    console.log('👤 User Email:', userEmail);

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(endpoint, {
        method: 'GET',
        headers
      });

      console.log('📈 Response Status:', response.status);
      console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
      console.log('✅ Response OK:', response.ok);

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📭 No banners found for user (404)');
          return [];
        }
        const errorText = await response.text();
        console.error('❌ Response Error Text:', errorText);
        throw new Error(`Failed to get user banners: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🎉 SUCCESS Response Body:', JSON.stringify(result, null, 2));
      console.log('📊 Number of banners:', Array.isArray(result) ? result.length : 0);

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('💥 AZURE API ERROR - GET USER BANNERS:', error);
      console.error('🔍 Error Type:', typeof error);
      console.error('📝 Error Message:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network Error: Unable to connect to Azure API');
        console.error('🔗 Check if the endpoint is accessible:', endpoint);
      }
      
      // Return empty array instead of throwing to avoid breaking the UI
      console.warn('⚠️ Returning empty banners array due to API error');
      return [];
    }
  }

  // Convertir conversación de Azure a formato interno
  convertToInternalFormat(azureConv: AzureConversation, files: AzureFileInfo[] = []): Conversation {
    // Ensure files is always an array
    const validFiles = Array.isArray(files) ? files : [];
    
    const messages: ChatMessage[] = azureConv.messages.map((msg, index) => {
      // Ensure timestamp is a proper Date object
      let timestamp: Date;
      if (typeof msg.timestamp === 'string') {
        timestamp = new Date(msg.timestamp);
        // Validate the date is valid
        if (isNaN(timestamp.getTime())) {
          console.warn('Invalid timestamp received from Azure:', msg.timestamp, 'using current time');
          timestamp = new Date();
        }
      } else {
        // If it's not a string, treat it as invalid and use current time
        console.warn('Unexpected timestamp type from Azure:', typeof msg.timestamp, 'using current time');
        timestamp = new Date();
      }
      
      // Buscar archivos que corresponden a este mensaje - with proper array validation
      const messageFiles = validFiles.filter(file => {
        if (!file || !file.uploaded_at) return false;
        
        try {
          const fileUploadTime = new Date(file.uploaded_at);
          return fileUploadTime <= timestamp && 
                 (index === azureConv.messages.length - 1 || 
                  fileUploadTime <= new Date(azureConv.messages[index + 1]?.timestamp || Date.now()));
        } catch (error) {
          console.warn('Invalid file upload time:', file.uploaded_at);
          return false;
        }
      });

      // Combine Azure files with message files - with proper validation
      const msgFiles = Array.isArray(msg.files) ? msg.files : [];
      const combinedFiles = [
        ...msgFiles,
        ...messageFiles.map(file => ({
          name: file.fileName || 'unknown',
          size: 0, // No disponible en la respuesta de Azure
          type: 'application/octet-stream', // Tipo genérico
          url: file.url || ''
        }))
      ];

      return {
        id: `${azureConv.id}_${index}`,
        type: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp,
        files: combinedFiles.length > 0 ? combinedFiles : undefined,
        // Include all structured data from Azure
        data: msg.data,
        chart: msg.chart,
        downloadLink: msg.downloadLink,
        videoPreview: msg.videoPreview,
        metadata: msg.metadata,
        deviceInfo: msg.deviceInfo
      };
    });

    // Ensure conversation dates are proper Date objects
    let createdAt: Date;
    let updatedAt: Date;
    
    if (typeof azureConv.createdAt === 'string') {
      createdAt = new Date(azureConv.createdAt);
      if (isNaN(createdAt.getTime())) {
        console.warn('Invalid createdAt from Azure:', azureConv.createdAt);
        createdAt = new Date();
      }
    } else {
      // If it's not a string, use current time
      createdAt = new Date();
    }

    if (typeof azureConv.updatedAt === 'string') {
      updatedAt = new Date(azureConv.updatedAt);
      if (isNaN(updatedAt.getTime())) {
        console.warn('Invalid updatedAt from Azure:', azureConv.updatedAt);
        updatedAt = new Date();
      }
    } else {
      // If it's not a string, use current time
      updatedAt = new Date();
    }

    return {
      id: azureConv.id,
      title: azureConv.title,
      messages,
      createdAt,
      updatedAt,
      tags: azureConv.tags || [],
      isArchived: azureConv.isArchived || false,
      totalTokens: azureConv.totalTokens || 0
    };
  }

  // Convertir conversación interna a formato de Azure - UPDATED to include messageId and feedback
  convertToAzureFormat(conversation: Conversation): Partial<AzureConversation> {
    return {
      id: conversation.id,
      title: conversation.title,
      messages: conversation.messages.map(msg => ({
        messageId: msg.id, // Agregar messageId
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        // Include all structured data
        data: msg.data,
        chart: msg.chart,
        downloadLink: msg.downloadLink,
        videoPreview: msg.videoPreview,
        files: msg.files,
        metadata: msg.metadata,
        deviceInfo: msg.deviceInfo
      })),
      tags: conversation.tags,
      isArchived: conversation.isArchived,
      totalTokens: conversation.totalTokens,
      updatedAt: conversation.updatedAt.toISOString()
    };
  }

  // Convertir a resumen de conversación
  convertToSummary(azureConv: AzureConversation): ConversationSummary {
    return {
      id: azureConv.id,
      title: azureConv.title,
      messageCount: azureConv.messages.length,
      lastMessage: azureConv.messages[azureConv.messages.length - 1]?.content || '',
      createdAt: new Date(azureConv.createdAt),
      updatedAt: new Date(azureConv.updatedAt),
      tags: azureConv.tags
    };
  }
}

export const azureConversationService = new AzureConversationService();
