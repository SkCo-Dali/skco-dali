
import React, { createContext, useContext, useState } from 'react';
import { Conversation, ConversationSummary } from '../types/conversation';
import { ChatMessage } from '../types/chat';
import { azureConversationService } from '../services/azureConversationService';
import { useAuth } from './AuthContext';

interface SimpleConversationContextType {
  conversations: ConversationSummary[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  loadConversationsList: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  createNewConversation: () => void;
  deleteConversation: (id: string) => Promise<void>;
}

const SimpleConversationContext = createContext<SimpleConversationContextType | undefined>(undefined);

export const SimpleConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const userEmail = user?.email || '';

  const loadConversationsList = async () => {
    if (!userEmail) return;
    
    try {
      setIsLoading(true);
      console.log('SimpleConversationContext: Loading conversations list for:', userEmail);
      
      const azureConversations = await azureConversationService.listUserConversations(userEmail);
      const summaries = azureConversations.map(conv => 
        azureConversationService.convertToSummary(conv)
      );
      
      setConversations(summaries);
      console.log('SimpleConversationContext: Loaded', summaries.length, 'conversations');
    } catch (error) {
      console.error('SimpleConversationContext: Error loading conversations:', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (id: string) => {
    if (!userEmail || !id) return;
    
    try {
      setIsLoading(true);
      console.log('SimpleConversationContext: Loading conversation:', id);
      
      const azureConversation = await azureConversationService.getConversation(id, userEmail);
      if (!azureConversation) {
        console.log('SimpleConversationContext: Conversation not found');
        return;
      }

      const files = await azureConversationService.getConversationFiles(id, userEmail);
      const conversation = azureConversationService.convertToInternalFormat(azureConversation, files);
      
      setCurrentConversation(conversation);
      console.log('SimpleConversationContext: Loaded conversation with', conversation.messages.length, 'messages');
    } catch (error) {
      console.error('SimpleConversationContext: Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (message: ChatMessage) => {
    console.log('SimpleConversationContext: Adding message:', message.type, message.content.substring(0, 50));
    setCurrentConversation(prev => {
      if (!prev) {
        console.log('SimpleConversationContext: No current conversation, cannot add message');
        return null;
      }
      
      const updated = {
        ...prev,
        messages: [...prev.messages, message],
        updatedAt: new Date()
      };
      
      return updated;
    });
  };

  const createNewConversation = () => {
    const newId = Date.now().toString();
    
    const newConversation: Conversation = {
      id: newId,
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      isArchived: false,
      totalTokens: 0
    };
    
    setCurrentConversation(newConversation);
  };

  const deleteConversation = async (id: string) => {
    if (!userEmail) return;
    
    try {
      console.log('SimpleConversationContext: Deleting conversation:', id);
      await azureConversationService.deleteConversation(id, userEmail);
      
      setConversations(prev => prev.filter(c => c.id !== id));
      
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
      }
      
      console.log('SimpleConversationContext: Conversation deleted');
    } catch (error) {
      console.error('SimpleConversationContext: Error deleting conversation:', error);
      throw error;
    }
  };

  return (
    <SimpleConversationContext.Provider value={{
      conversations,
      currentConversation,
      isLoading,
      loadConversationsList,
      loadConversation,
      addMessage,
      createNewConversation,
      deleteConversation
    }}>
      {children}
    </SimpleConversationContext.Provider>
  );
};

export const useSimpleConversation = () => {
  const context = useContext(SimpleConversationContext);
  if (context === undefined) {
    throw new Error('useSimpleConversation must be used within a SimpleConversationProvider');
  }
  return context;
};
