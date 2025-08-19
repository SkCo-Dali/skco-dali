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
import { templatesService } from '../services/templatesService';
import { PromptTemplate } from '../types/templates';
import { useIsMobile } from '../hooks/use-mobile';
import { ConversationHistoryModal } from './ConversationHistoryModal';
import { PromptTemplates } from './PromptTemplates';
import { ENV } from '../config/environment';
import { Button } from './ui/button';

// Genera un título “inteligente” desde el 1er mensaje del usuario
const generateConversationTitle = (message: string): string => {
  const cleanMessage = message.trim();
  if (cleanMessage.length <= 30) return cleanMessage;

  const firstSentence = cleanMessage.split(/[.!?]/)[0];
  if (firstSentence.length <= 50) return firstSentence.trim();

  const words = cleanMessage.split(' ');
  let title = '';
  for (const w of words) {
    if ((title + ' ' + w).length > 45) break;
    title = title ? `${title} ${w}` : w;
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

  const userEmail = user?.email || '';
  const messages = currentConversation?.messages || [];

  // ===== Templates para el carrusel =====
  useEffect(() => {
    const loadTemplates = async () => {
      if (!userEmail) return;
      try {
        setTemplatesLoading(true);
        setTemplatesError(null);
        const allTemplates = await templatesService.getSystemTemplates(userEmail);
        setTemplates(allTemplates.slice(0, 6));
      } catch (err) {
        setTemplatesError(err instanceof Error ? err.message : 'Unknown error');
        setTemplates([]);
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, [userEmail]);

  // Permite setear el input desde fuera (PromptTemplates, etc.)
  useEffect(() => {
    (window as any).setTemplateContent = (content: string) => setInputMessage(content);
    return () => { delete (window as any).setTemplateContent; };
  }, []);

  // Scroll helpers
  const scrollToBottom = (smooth = true) => {
    // scrollea dentro del contenedor de mensajes (no en el body)
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollToBottom(!nearBottom && messages.length > 0);
  };

  // Auto scroll al recibir nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      const t = setTimeout(() => scrollToBottom(true), 80);
      return () => clearTimeout(t);
    }
  }, [messages.length]);

  // Exponer métodos imperativos al padre
  useImperativeHandle(ref, () => ({
    handleBannerMessage: (automaticReply: string) => handleSendMessage(automaticReply),
    setInputMessage: (content: string) => setInputMessage(content),
    handleStartNewConversation: () => {
      setInputMessage('');
      createNewConversation();
    }
  }));

  // Crear conversación si no existe
  useEffect(() => {
    if (!currentConversation) createNewConversation();
  }, [currentConversation, createNewConversation]);

  // ===== Envío de mensaje =====
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
      // ¿Es nueva conversación?
      const isNewConversation = messages.length === 0;
      const conversationTitle = isNewConversation
        ? generateConversationTitle(content)
        : currentConversation.title;

      // Crear/actualizar conversación en tu backend
      if (isNewConversation) {
        const conversationData = {
          id: currentConversation.id,
          userId: userEmail,
          title: conversationTitle,
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

        const { SecureTokenManager } = await import('@/utils/secureTokenManager');
        const tokenData = SecureTokenManager.getToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (tokenData?.token) headers['Authorization'] = `Bearer ${tokenData.token}`;

        const res = await fetch(`${ENV.AI_API_BASE_URL}/api/conversations`, {
          method: 'POST',
          headers,
          body: JSON.stringify(conversationData)
        });
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Failed to create conversation: ${res.status} ${res.statusText} - ${errorText}`);
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
            data: (msg as any).data,
            chart: (msg as any).chart,
            downloadLink: (msg as any).downloadLink,
            videoPreview: (msg as any).videoPreview,
            metadata: (msg as any).metadata
          })),
          updatedAt: new Date().toISOString(),
          tags: currentConversation.tags,
          isArchived: currentConversation.isArchived,
          totalTokens: currentConversation.totalTokens
        };

        const { SecureTokenManager: STMUpdate } = await import('@/utils/secureTokenManager');
        const tokenData = STMUpdate.getToken();
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (tokenData?.token) headers['Authorization'] = `Bearer ${tokenData.token}`;

        const res = await fetch(
          `${ENV.AI_API_BASE_URL}/api/conversations/${currentConversation.id}?user_id=${encodeURIComponent(userEmail)}`,
          { method: 'PUT', headers, body: JSON.stringify(conversationUpdate) }
        );
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Error updating conversation:', res.status, errorText);
        }
      }

      // Llamada al agente
      const response = await callAzureAgentApi('', [], aiSettings, userEmail, accessToken, currentConversation.id);

      // Preparar respuesta del asistente
      let aiResponseContent = '';
      if ((response as any).text) {
        aiResponseContent = (response as any).text;
      } else if ((response as any).data) {
        const d = (response as any).data;
        if (d.headers && d.rows) {
          aiResponseContent = `Se encontraron ${d.rows.length} registros con los siguientes campos: ${d.headers.join(', ')}`;
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
        data: (response as any).data,
        chart: (response as any).chart,
        downloadLink: (response as any).downloadLink,
        videoPreview: (response as any).videoPreview
      };

      addMessage(aiMessage);

      // Update final con el título (si cambió) y mensajes finales
      const finalMessages = [...messages, userMessage, aiMessage];
      const conversationFinalUpdate = {
        id: currentConversation.id,
        userId: userEmail,
        title: conversationTitle,
        messages: finalMessages.map(msg => ({
          messageId: msg.id,
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          data: (msg as any).data,
          chart: (msg as any).chart,
          downloadLink: (msg as any).downloadLink,
          videoPreview: (msg as any).videoPreview,
          metadata: (msg as any).metadata
        })),
        updatedAt: new Date().toISOString(),
        tags: currentConversation.tags,
        isArchived: currentConversation.isArchived,
        totalTokens: currentConversation.totalTokens
      };

      const { SecureTokenManager: STMFinal } = await import('@/utils/secureTokenManager');
      const finalToken = STMFinal.getToken();
      const finalHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
      if (finalToken?.token) finalHeaders['Authorization'] = `Bearer ${finalToken.token}`;

      const finalRes = await fetch(
        `${ENV.AI_API_BASE_URL}/api/conversations/${currentConversation.id}?user_id=${encodeURIComponent(userEmail)}`,
        { method: 'PUT', headers: finalHeaders, body: JSON.stringify(conversationFinalUpdate) }
      );
      if (!finalRes.ok) {
        const errorText = await finalRes.text();
        console.error('Error in final conversation update:', finalRes.status, errorText);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      addMessage({
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
      // seguridad extra para mantener vista al final
      scrollToBottom(true);
    }
  };

  // Handlers auxiliares
  const handleTemplateSelect = (content: string) => setInputMessage(content);

  return (
    <>
      {/* CONTENEDOR PRINCIPAL: usa toda la altura disponible del padre */}
      <div className="h-650px w-full flex flex-col min-h-0 bg-background">

        {/* MENSAJES — ÚNICO LUGAR CON SCROLL */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto px-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
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
                  <PromptCarousel templates={templates} onSelectTemplate={handleTemplateSelect} />
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
              {messages.map((m) => <SimpleMessage key={m.id} message={m} />)}
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

        {/* BOTÓN FLOTANTE IR AL FINAL (posicionamiento fijo respecto a la ventana) */}
        {showScrollToBottom && (
          <div className="fixed bottom-24 right-6 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollToBottom(true)}
              className="h-10 w-10 rounded-full shadow-lg bg-background border-border hover:bg-accent"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* INPUT — SIEMPRE VISIBLE (no scrollea) */}
        <div className="border-t bg-background sticky bottom-0 flex-shrink-0">
          <SimpleInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            value={inputMessage}
            onChange={setInputMessage}
          />
        </div>
      </div>

      {/* MODALES */}
      <ConversationHistoryModal
        isOpen={showConversationModal}
        onClose={() => setShowConversationModal(false)}
      />

      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] overflow-hidden">
            <PromptTemplates
              onSelectTemplate={(c) => { setShowTemplatesModal(false); setInputMessage(c); }}
              onClose={() => setShowTemplatesModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
});

SimpleChatInterface.displayName = 'SimpleChatInterface';

