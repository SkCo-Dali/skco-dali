
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Conversation, Message, ConversationSummary } from '@/types/conversation';

interface SimpleConversationContextType {
  conversations: ConversationSummary[];
  currentConversation: Conversation | undefined;
  isLoading: boolean;
  setConversations: (conversations: ConversationSummary[]) => void;
  setCurrentConversation: (conversation: Conversation | undefined) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  createNewConversation: () => void;
  loadConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  loadConversationsList: () => Promise<void>;
}

const SimpleConversationContext = createContext<SimpleConversationContextType | undefined>(undefined);

export const SimpleConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message: Message) => {
    if (!currentConversation) return;

    setCurrentConversation(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [...prev.messages, message],
        updatedAt: new Date()
      };
    });

    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversation.id 
          ? { 
              ...conv, 
              messageCount: conv.messageCount + 1,
              lastMessage: message.content,
              updatedAt: new Date() 
            }
          : conv
      )
    );
  }, [currentConversation]);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    if (!currentConversation) return;

    setCurrentConversation(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      };
    });
  }, [currentConversation]);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      isArchived: false,
      totalTokens: 0
    };

    const newSummary: ConversationSummary = {
      id: newConversation.id,
      title: newConversation.title,
      messageCount: 0,
      lastMessage: '',
      createdAt: newConversation.createdAt,
      updatedAt: newConversation.updatedAt,
      tags: []
    };

    setConversations(prev => [newSummary, ...prev]);
    setCurrentConversation(newConversation);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement actual loading logic from API
      console.log('Loading conversation:', id);
      
      // Mock implementation for now
      const mockConversation: Conversation = {
        id,
        title: 'Loaded Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        isArchived: false,
        totalTokens: 0
      };
      
      setCurrentConversation(mockConversation);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      // TODO: Implement actual deletion logic with API
      console.log('Deleting conversation:', id);
      
      setConversations(prev => prev.filter(conv => conv.id !== id));
      
      if (currentConversation?.id === id) {
        setCurrentConversation(undefined);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [currentConversation]);

  const loadConversationsList = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Implement actual loading logic from API
      console.log('Loading conversations list');
      
      // Mock implementation for now
      const mockConversations: ConversationSummary[] = [];
      setConversations(mockConversations);
    } catch (error) {
      console.error('Error loading conversations list:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    conversations,
    currentConversation,
    isLoading,
    setConversations,
    setCurrentConversation,
    addMessage,
    updateMessage,
    createNewConversation,
    loadConversation,
    deleteConversation,
    loadConversationsList
  }), [
    conversations, 
    currentConversation, 
    isLoading,
    addMessage, 
    updateMessage, 
    createNewConversation,
    loadConversation,
    deleteConversation,
    loadConversationsList
  ]);

  return (
    <SimpleConversationContext.Provider value={contextValue}>
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
