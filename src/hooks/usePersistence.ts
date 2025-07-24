
import { useState, useEffect } from 'react';
import { azureConversationService } from '../services/azureConversationService';
import { useAuth } from '../contexts/AuthContext';
import { Conversation } from '../types/conversation';
import { ChatMessage } from '../types/chat';
import { AISettings, AppSettings } from '../types/settings';
import { ENV } from '../config/environment';

export const usePersistence = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !isInitialized) {
      initializeUserPersistence();
    }
  }, [user, isInitialized]);

  const initializeUserPersistence = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('usePersistence: Initializing Azure persistence with Entra ID token for:', user.email);
      // With Azure, initialization is automatic when user logs in
      // Conversations are loaded automatically in the ConversationContext
      // The Entra ID token is handled automatically by the service layer
      setIsInitialized(true);
      
    } catch (error) {
      console.error('Failed to initialize Azure persistence:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize persistence');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConversation = async (conversation: Conversation) => {
    if (!user || !isInitialized) return;
    
    try {
      setError(null);
      console.log('usePersistence: Saving conversation to Azure with Entra ID authorization:', conversation.id);
      const azureFormat = azureConversationService.convertToAzureFormat(conversation);
      await azureConversationService.updateConversation(conversation.id, user.email, azureFormat);
      console.log('usePersistence: Conversation saved to Azure successfully with Entra ID token');
    } catch (error) {
      console.error('Failed to save conversation to Azure:', error);
      setError(error instanceof Error ? error.message : 'Failed to save conversation');
    }
  };

  const loadConversation = async (conversationId: string): Promise<Conversation | null> => {
    if (!user || !isInitialized) return null;
    
    try {
      setError(null);
      console.log('usePersistence: Loading conversation from Azure with Entra ID authorization:', conversationId);
      const azureConv = await azureConversationService.getConversation(conversationId, user.email);
      if (azureConv) {
        const files = await azureConversationService.getConversationFiles(conversationId, user.email);
        const conversation = azureConversationService.convertToInternalFormat(azureConv, files);
        console.log('usePersistence: Conversation loaded from Azure successfully with Entra ID token');
        return conversation;
      }
      console.log('usePersistence: Conversation not found in Azure');
      return null;
    } catch (error) {
      console.error('Failed to load conversation from Azure:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversation');
      return null;
    }
  };

  const getUserConversations = async (archived = false) => {
    if (!user || !isInitialized) return [];
    
    try {
      setError(null);
      console.log('usePersistence: Getting user conversations from Azure with Entra ID authorization');
      const azureConversations = await azureConversationService.listUserConversations(user.email);
      const filtered = azureConversations.filter(conv => conv.isArchived === archived);
      const summaries = filtered.map(conv => azureConversationService.convertToSummary(conv));
      console.log('usePersistence: Retrieved', summaries.length, 'conversations from Azure with Entra ID token');
      return summaries;
    } catch (error) {
      console.error('Failed to get user conversations from Azure:', error);
      setError(error instanceof Error ? error.message : 'Failed to get conversations');
      return [];
    }
  };

  const saveMessageFeedback = async (
    messageId: string,
    conversationId: string,
    feedback: 'positive' | 'negative',
    comment?: string
  ) => {
    if (!user || !isInitialized) return;
    
    try {
      setError(null);
      console.log('usePersistence: Saving message feedback to Azure with Entra ID authorization:', { messageId, conversationId, feedback });
      // TODO: Implement feedback endpoint in Azure backend with Entra ID token
      console.log('Message feedback logged for Azure implementation with Entra ID token:', { messageId, conversationId, feedback, comment });
    } catch (error) {
      console.error('Failed to save message feedback to Azure:', error);
      setError(error instanceof Error ? error.message : 'Failed to save feedback');
    }
  };

  const saveUserSettings = async (aiSettings: AISettings, appSettings: AppSettings) => {
    if (!user || !isInitialized) return;
    
    try {
      setError(null);
      console.log('usePersistence: Saving user settings to Azure with Entra ID authorization:', user.email);
      // TODO: Implement settings endpoints in Azure backend with Entra ID token
      console.log('User settings logged for Azure implementation with Entra ID token:', { aiSettings, appSettings });
    } catch (error) {
      console.error('Failed to save user settings to Azure:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    }
  };

  const loadUserSettings = async () => {
    if (!user || !isInitialized) return null;
    
    try {
      setError(null);
      console.log('usePersistence: Loading user settings from Azure with Entra ID authorization:', user.email);
      // TODO: Implement settings endpoints in Azure backend with Entra ID token
      console.log('Loading user settings from Azure with Entra ID token - to be implemented');
      return null;
    } catch (error) {
      console.error('Failed to load user settings from Azure:', error);
      setError(error instanceof Error ? error.message : 'Failed to load settings');
      return null;
    }
  };

  const uploadFile = async (file: File, conversationId: string, messageId: string) => {
    if (!user || !isInitialized) return null;
    
    try {
      setError(null);
      console.log('usePersistence: Uploading file to Azure with Entra ID authorization:', file.name, conversationId);
      const fileName = await azureConversationService.uploadFile(file, user.email, conversationId);
      const fileData = {
        fileName,
        url: `${ENV.AI_API_BASE_URL}/api/files/${fileName}`,
        size: file.size,
        type: file.type
      };
      console.log('usePersistence: File uploaded to Azure successfully with Entra ID token:', fileData);
      return fileData;
    } catch (error) {
      console.error('Failed to upload file to Azure:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
      return null;
    }
  };

  return {
    isInitialized,
    isLoading,
    error,
    saveConversation,
    loadConversation,
    getUserConversations,
    saveMessageFeedback,
    saveUserSettings,
    loadUserSettings,
    uploadFile
  };
};
