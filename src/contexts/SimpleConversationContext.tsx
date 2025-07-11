
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Conversation, Message } from '@/types/conversation';

interface SimpleConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | undefined;
  setConversations: (conversations: Conversation[]) => void;
  setCurrentConversation: (conversation: Conversation | undefined) => void;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  createNewConversation: () => void;
}

const SimpleConversationContext = createContext<SimpleConversationContextType | undefined>(undefined);

export const SimpleConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | undefined>();

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
          ? { ...conv, messages: [...conv.messages, message], updatedAt: new Date() }
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

    setConversations(prev => 
      prev.map(conv => 
        conv.id === currentConversation.id 
          ? {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === messageId ? { ...msg, ...updates } : msg
              )
            }
          : conv
      )
    );
  }, [currentConversation]);

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  }, []);

  const contextValue = useMemo(() => ({
    conversations,
    currentConversation,
    setConversations,
    setCurrentConversation,
    addMessage,
    updateMessage,
    createNewConversation
  }), [conversations, currentConversation, addMessage, updateMessage, createNewConversation]);

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
