import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { SimpleMessage } from './SimpleMessage';
import { SimpleInput } from './SimpleInput';
import { PromptCarousel } from './PromptCarousel';
import { useSimpleConversation } from '../contexts/SimpleConversationContext';
import { ChatMessage } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';
import { callAzureAgentApi } from '../utils/azureApiService';
import { useSettings } from '../contexts/SettingsContext';
import { azureConversationService } from '../services/azureConversationService';
import { templatesService } from '../services/templatesService';
import { PromptTemplate } from '../types/templates';
import { useIsMobile } from '../hooks/use-mobile';
import { ConversationHistoryModal } from './ConversationHistoryModal';
import { PromptTemplates } from './PromptTemplates';
import { ENV } from '../config/environment';
import { Button } from './ui/button';

// Function to generate a smart title from user message
const generateConversationTitle = (message: string): string => {
  // Clean the message and get first meaningful part
  const cleanMessage = message.trim();
  
  // If message is very short, use it as is
  if (cleanMessage.length <= 30) {
    return cleanMessage;
  }
  
  // Try to get the first sentence or meaningful phrase
  const firstSentence = cleanMessage.split(/[.!?]/)[0];
  if (firstSentence.length <= 50) {
    return firstSentence.trim();
  }
  
  // If still too long, truncate at word boundary
  const words = cleanMessage.split(' ');
  let title = '';
  for (const word of words) {
    if ((title + ' ' + word).length > 45) break;
    title = title ? title + ' ' + word : word;
  }
  
  return title || cleanMessage.substring(0, 45);
};

export const SimpleChatInterface = forwardRef<any, {}>((props, ref) => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const { currentConversation, addMessage, createNewConversation } = useSimpleConversation();
  const { user, accessToken } = useAuth();
  const { aiSettings } = useSettings();
  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const userEmail = user?.email || "";
  const messages = currentConversation?.messages || [];

  // Log counts
  console.log('🔵 SimpleChatInterface: Messages count:', messages.length);
  console.log('🔵 SimpleChatInterface: Templates count:', templates.length);

  // Load templates for carousel
  useEffect(() => {
    const loadTemplates = async () => {
      if (!userEmail) return;

      try {
        setTemplatesLoading(true);
        setTemplatesError(null);
        const allTemplates = await templatesService.getSystemTemplates(userEmail);
        const carouselTemplates = allTemplates.slice(0, 6);
        setTemplates(carouselTemplates);
      } catch (error) {
        setTemplatesError(error instanceof Error ? error.message : 'Unknown error');
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };

    loadTemplates();
  }, [userEmail]);

  // Register global setTemplateContent function
  useEffect(() => {
    window.setTemplateContent = (content: string) => {
      setInputMessage(content);
    };
    return () => {
      delete window.setTemplateContent;
    };
  }, []);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll events to show/hide scroll to bottom button
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollToBottom(!isScrolledToBottom && messages.length > 0);
    }
  };

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    handleBannerMessage: (automaticReply: string) => {
      handleSendMessage(automaticReply);
    },
    setInputMessage: (content: string) => {
      setInputMessage(content);
    },
    handleStartNewConversation: () => {
      setInputMessage('');
      createNewConversation();
    }
  }));

  useEffect(() => {
    if (!currentConversation) {
      createNewConversation();
    }
  }, [currentConversation, createNewConversation]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentConversation) return;

    setInputMessage('');

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setIsLoading(true);

    try {
      // Generate smart title for new conversations
      const isNewConversation = messages.length === 0;
      const conversationTitle = isNewConversation 
        ? generateConversationTitle(content)
        : currentConversation.title;

      // Crear/Actualizar conversación y llamada API
      if (messages.length === 0) {
        const conversationData = {
          id: currentConversation.id,
          userId: userEmail,
          title: conversationTitle, // Use generated title
          messages: [{
            messageId: userMessage.id,
            role: 'user' as const,
            content: userMessage.content,
            timestamp: userMessage.timestamp.toISOString()
          }],
          createdAt: currentConversation.createdAt.toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          isArchived: false,
          totalTokens: 0,
          attachments: []
        };
        // Get auth headers
        const { SecureTokenManager } = await import('@/utils/secureTokenManager');
        const tokenData = SecureTokenManager.getToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (tokenData && tokenData.token) {
          headers['Authorization'] = `Bearer ${tokenData.token}`;
        }

        const response = await fetch(`${ENV.AI_API_BASE_URL}/api/conversations`, {
          method: 'POST',
          headers,
          body: JSON.stringify(conversationData)
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create conversation: ${response.status} ${response.statusText} - ${errorText}`);
        }
      } else {
        const updatedMessages = [...messages, userMessage];
        const conversationUpdate = {
          id: currentConversation.id,
          userId: userEmail,
          title: currentConversation.title,
          messages: updatedMessages.map(msg => ({
            messageId: msg.id,
            role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
            data: msg.data,
            chart: msg.chart,
            downloadLink: msg.downloadLink,
            videoPreview: msg.videoPreview,
            metadata: msg.metadata
          })),
          updatedAt: new Date().toISOString(),
          tags: currentConversation.tags,
          isArchived: currentConversation.isArchived,
          totalTokens: currentConversation.totalTokens
        };
        // Get auth headers for update
        const { SecureTokenManager: STMUpdate } = await import('@/utils/secureTokenManager');
        const updateTokenData = STMUpdate.getToken();
        const updateHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
        if (updateTokenData && updateTokenData.token) {
          updateHeaders['Authorization'] = `Bearer ${updateTokenData.token}`;
        }

        const updateResponse = await fetch(`${ENV.AI_API_BASE_URL}/api/conversations/${currentConversation.id}?user_id=${encodeURIComponent(userEmail)}`, {
          method: 'PUT',
          headers: updateHeaders,
          body: JSON.stringify(conversationUpdate)
        });
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Error updating conversation:', updateResponse.status, errorText);
        }
      }

      const response = await callAzureAgentApi(
        '',
        [],
        aiSettings,
        userEmail,
        accessToken,
        currentConversation.id
      );

      let aiResponseContent = '';
      if (response.text) {
        aiResponseContent = response.text;
      } else if (response.data) {
        if (response.data.headers && response.data.rows) {
          aiResponseContent = `Se encontraron ${response.data.rows.length} registros con los siguientes campos: ${response.data.headers.join(', ')}`;
        } else {
          aiResponseContent = 'Se procesaron los datos correctamente.';
        }
      } else {
        aiResponseContent = 'Respuesta recibida del sistema.';
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponseContent,
        timestamp: new Date(),
        data: response.data,
        chart: response.chart,
        downloadLink: response.downloadLink,
        videoPreview: response.videoPreview
      };

      addMessage(aiMessage);

      const finalMessages = [...messages, userMessage, aiMessage];
      const conversationFinalUpdate = {
        id: currentConversation.id,
        userId: userEmail,
        title: conversationTitle, // Use the same generated title
        messages: finalMessages.map(msg => ({
          messageId: msg.id,
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          data: msg.data,
          chart: msg.chart,
          downloadLink: msg.downloadLink,
          videoPreview: msg.videoPreview,
          metadata: msg.metadata
        })),
        updatedAt: new Date().toISOString(),
        tags: currentConversation.tags,
        isArchived: currentConversation.isArchived,
        totalTokens: currentConversation.totalTokens
      };

      // Get auth headers for final update
      const { SecureTokenManager: STM } = await import('@/utils/secureTokenManager');
      const finalTokenData = STM.getToken();
      const finalHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (finalTokenData && finalTokenData.token) {
        finalHeaders['Authorization'] = `Bearer ${finalTokenData.token}`;
      }

      const finalUpdateResponse = await fetch(`${ENV.AI_API_BASE_URL}/api/conversations/${currentConversation.id}?user_id=${encodeURIComponent(userEmail)}`, {
        method: 'PUT',
        headers: finalHeaders,
        body: JSON.stringify(conversationFinalUpdate)
      });

      if (!finalUpdateResponse.ok) {
        const errorText = await finalUpdateResponse.text();
        console.error('Error in final conversation update:', finalUpdateResponse.status, errorText);
      }

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        timestamp: new Date()
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversation = () => {
    setInputMessage('');
    createNewConversation();
  };

  const handleTemplateSelect = (content: string) => {
    setInputMessage(content);
  };

  const handleSearchConversations = () => {
    setShowConversationModal(true);
  };

  const handleViewTemplates = () => {
    setShowTemplatesModal(true);
  };

  const handleSelectTemplate = (content: string) => {
    setShowTemplatesModal(false);
    setInputMessage(content);
  };

  return (
    <>
      {/* Contenedor principal con altura de viewport completa */}
      <div className="flex flex-col h-auto w-full max-w-6xl mx-auto bg-background m-16">
        
        {/* Área de mensajes con scroll independiente */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto overflow-x-hidden bg-background"
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full w-full px-4">
              <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full mx-auto mb-4 bg-green-100 p-2 overflow-hidden`}>
                <img 
                  src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.gif" 
                  alt="Dali AI Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className={`text-muted-foreground mb-4 text-center ${isMobile ? 'text-sm px-2' : ''}`}>
                ¡Hola! Soy Dali, tu asistente de IA. ¿En qué puedo ayudarte hoy?
              </p>

              {templatesLoading && (
                <p className={`text-center text-muted-foreground w-full ${isMobile ? 'text-sm' : ''}`}>
                  Cargando plantillas...
                </p>
              )}

              {templatesError && (
                <p className={`text-center text-destructive w-full ${isMobile ? 'text-sm' : ''}`}>
                  Error cargando plantillas: {templatesError}
                </p>
              )}

              {!templatesLoading && !templatesError && templates.length > 0 && (
                <div className="w-full">
                  <h3 className={`font-medium text-muted-foreground mb-2 text-center ${isMobile ? 'text-sm px-2' : 'text-sm'}`}>
                    Prueba estas plantillas para comenzar:
                  </h3>
                  <PromptCarousel 
                    templates={templates}
                    onSelectTemplate={handleTemplateSelect}
                  />
                </div>
              )}

              {!templatesLoading && !templatesError && templates.length === 0 && (
                <p className={`text-center text-muted-foreground w-full ${isMobile ? 'text-sm' : ''}`}>
                  No hay plantillas disponibles
                </p>
              )}
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto px-4 py-4">
              {messages.map((message) => (
                <SimpleMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-card rounded-2xl px-4 py-3 border shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Pensando...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Botón flotante para ir al final */}
        {showScrollToBottom && (
          <div className="fixed bottom-24 right-6 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={scrollToBottom}
              className="h-10 w-10 rounded-full shadow-lg bg-background border-border hover:bg-accent"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Input fijo en la parte inferior */}
        <div className="border-t bg-background flex-shrink-0 sticky bottom-0">
          <SimpleInput 
            onSendMessage={handleSendMessage} 
            disabled={isLoading}
            value={inputMessage}
            onChange={setInputMessage}
          />
        </div>
      </div>

      {/* Modales */}
      <ConversationHistoryModal 
        isOpen={showConversationModal}
        onClose={() => setShowConversationModal(false)}
      />

      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] overflow-hidden">
            <PromptTemplates
              onSelectTemplate={handleSelectTemplate}
              onClose={() => setShowTemplatesModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
});

SimpleChatInterface.displayName = 'SimpleChatInterface';
