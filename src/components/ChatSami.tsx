import React, { useEffect, useState, useRef } from "react";
import { ExternalLink, Minus, Lightbulb, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { opportunitiesService } from "@/services/opportunitiesService";
import { IOpportunity } from "@/types/opportunities";
import { SimpleMessage } from "./SimpleMessage";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useSimpleConversation } from "@/contexts/SimpleConversationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { callAzureAgentApi } from "@/utils/azureApiService";
import { ChatMessage } from "@/types/chat";
import { useIsMobile } from "@/hooks/use-mobile";

type ChatSamiProps = {
  /** Opcional: iniciar minimizado */
  defaultMinimized?: boolean;
};

type ViewMode = "hidden" | "minimized" | "maximized";

export default function ChatSami({ defaultMinimized = false }: ChatSamiProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMinimized ? "minimized" : "hidden");
  const [topOpportunity, setTopOpportunity] = useState<IOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [opportunityLoading, setOpportunityLoading] = useState(true);
  
  const { currentConversation, addMessage, createNewConversation } = useSimpleConversation();
  const { user } = useAuth();
  const { aiSettings } = useSettings();
  const isMobile = useIsMobile();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userEmail = user?.email || '';
  const messages = currentConversation?.messages || [];

  // Crear conversación si no existe
  useEffect(() => {
    if (!currentConversation) {
      createNewConversation();
    }
  }, [currentConversation, createNewConversation]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = isMobile ? 100 : 120;
      const minHeight = isMobile ? 40 : 44;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    }
  }, [inputMessage, isMobile]);

  // Scroll to bottom cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  // Cargar oportunidad top 1
  useEffect(() => {
    const loadTopOpportunity = async () => {
      try {
        setOpportunityLoading(true);
        console.log('Cargando oportunidades...');
        const opportunities = await opportunitiesService.getOpportunities(undefined, 'relevance');
        console.log('Oportunidades cargadas:', opportunities);
        if (opportunities.length > 0) {
          setTopOpportunity(opportunities[0]);
          console.log('Top oportunidad:', opportunities[0]);
        }
      } catch (error) {
        console.error("Error cargando oportunidad:", error);
      } finally {
        setOpportunityLoading(false);
      }
    };
    loadTopOpportunity();
  }, []);

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentConversation) return;

    const messageContent = inputMessage.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await callAzureAgentApi(
        '',
        [],
        aiSettings,
        userEmail,
        currentConversation.id
      );

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

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponseContent,
        timestamp: new Date(),
        data: (response as any).data,
        chart: (response as any).chart,
        downloadLink: (response as any).downloadLink,
        videoPreview: (response as any).videoPreview
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Lo siento, hubo un error al procesar tu mensaje.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <ThemeProvider>
      <SettingsProvider>
        <>
          {/* Burbuja flotante */}
          {viewMode === "hidden" && (
        <button
          onClick={() => setViewMode("minimized")}
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-transparent transition-all duration-200 flex items-center justify-center group"
          aria-label="Abrir SamiGPT"
        >
          <img
            src="https://skcoblobresources.blob.core.windows.net/digital-assets/animations/sk-sami-contigo.gif"
            alt="SamiGPT"
            className="w-14 h-14"
          />
        </button>
      )}

      {/* Panel minimizado */}
      {viewMode === "minimized" && (
        <div className="flex flex-col w-[280px] border bg-background shadow-md rounded-xl h-[90%]">
          {/* Header */}
          <div className="flex items-center justify-between p-2 bg-[#fafafa] shrink-0">
            <h2 className="text-md font-semibold text-foreground">SamiGPT</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("maximized")}
                className="h-8 w-8 hover:bg-muted"
                aria-label="Abrir en ventana"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("hidden")}
                className="h-8 w-8 hover:bg-muted"
                aria-label="Minimizar"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tip del día */}
          <div className="p-2 space-y-3 shrink-0">
            <div className="flex items-center gap-2 bg-[#e8f5e9] rounded-full p-2">
              <div className="shrink-0 bg-black rounded-full p-1.5">
                <Lightbulb className="h-4 w-4 text-[#00c83c]" />
              </div>
              <span className="text-sm font-medium text-foreground">Oportunidad de hoy✨</span>
            </div>

            {opportunityLoading ? (
              <div className="space-y-2 border rounded-xl p-2">
                <p className="text-sm text-muted-foreground">Cargando oportunidad...</p>
              </div>
            ) : topOpportunity ? (
              <div className="space-y-2 border rounded-xl p-2">
                <p className="text-sm font-semibold text-foreground">
                  {topOpportunity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Comisiones Potenciales{" "}
                  <span className="font-semibold">
                    ${topOpportunity.metrics?.estimatedSales?.toLocaleString() || "N/A"}
                  </span>
                </p>
                <button 
                  onClick={() => handleQuickAction(`Más información sobre: ${topOpportunity.title}`)}
                  className="w-full text-sm text-center text-secondary font-medium hover:underline"
                >
                  Ver Oportunidad
                </button>
              </div>
            ) : (
              <div className="space-y-2 border rounded-xl p-2">
                <p className="text-sm text-muted-foreground">No hay oportunidades disponibles</p>
              </div>
            )}
          </div>

          {/* Chat Dali */}
          <div className="flex-1 min-h-0 m-2 flex flex-col bg-background rounded-lg border">
            {/* Messages area */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-3 space-y-3"
            >
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">¡Hola! Soy Dali, tu asistente de IA. ¿En qué puedo ayudarte hoy?</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <SimpleMessage key={msg.id} message={msg} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-2 border-t">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading ? "Enviando..." : "Escribe tu mensaje..."}
                  disabled={isLoading}
                  className="w-full resize-none transition-all duration-200 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring rounded-2xl min-h-[40px] text-sm pr-12"
                  rows={1}
                  style={{ 
                    height: '40px',
                    fontSize: '14px',
                    paddingRight: inputMessage.trim() ? '52px' : '12px'
                  }}
                />
                
                {inputMessage.trim() && (
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary hover:bg-primary/10 flex-shrink-0 h-[36px] w-[36px]"
                    size="icon"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="p-2 space-y-2 shrink-0">
            <button
              onClick={() => handleQuickAction("Consultar Informe 🚀")}
              className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
            >
              Consultar Informe 🚀
            </button>
            <button
              onClick={() => handleQuickAction("Ver Leads ℹ️")}
              className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
            >
              Ver Leads ℹ️
            </button>
            <button
              onClick={() => handleQuickAction("Ver Comisiones 📄")}
              className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
            >
              Ver Comisiones 📄
            </button>
          </div>
        </div>
      )}

      {/* Diálogo flotante maximizado */}
      {viewMode === "maximized" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col h-[85vh] w-[90vw] max-w-4xl bg-background rounded-xl shadow-2xl overflow-hidden border">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#fafafa] shrink-0">
              <h2 className="text-lg font-semibold text-foreground">SamiGPT</h2>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("minimized")}
                  className="h-8 w-8 hover:bg-muted"
                  aria-label="Minimizar"
                >
                  <Minus className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {/* Tip del día */}
                   
            <div className="p-4 space-y-3 shrink-0">
                   
              <div className="flex items-center gap-2 bg-[#e8f5e9] rounded-full p-2">
                 
                <div className="shrink-0 bg-black rounded-full p-1.5">
                                 <Lightbulb className="h-4 w-4 text-[#00c83c]" />
                </div>
                             <span className="text-sm font-medium text-foreground">Oportunidad de hoy✨</span>
              </div>
            {opportunityLoading ? (
              <div className="space-y-2 border rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Cargando oportunidad...</p>
              </div>
            ) : topOpportunity ? (
              <div className="space-y-2 border rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground">
                  {topOpportunity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Comisiones Potenciales{" "}
                  <span className="font-semibold">
                    ${topOpportunity.metrics?.estimatedSales?.toLocaleString() || "N/A"}
                  </span>
                </p>
                <button 
                  onClick={() => handleQuickAction(`Más información sobre: ${topOpportunity.title}`)}
                  className="w-full text-sm text-center text-secondary font-medium hover:underline"
                >
                  Ver Oportunidad
                </button>
              </div>
            ) : (
              <div className="space-y-2 border rounded-xl p-4">
                <p className="text-sm text-muted-foreground">No hay oportunidades disponibles</p>
              </div>
            )}
            </div>
            {/* Chat Dali */}
            <div className="flex-1 min-h-0 mx-4 flex flex-col bg-background rounded-lg border">
              {/* Messages area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">¡Hola! Soy Dali, tu asistente de IA. ¿En qué puedo ayudarte hoy?</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <SimpleMessage key={msg.id} message={msg} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 border-t">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isLoading ? "Enviando..." : "Escribe tu mensaje..."}
                    disabled={isLoading}
                    className="w-full resize-none transition-all duration-200 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring rounded-2xl min-h-[44px] text-sm pr-12"
                    rows={1}
                    style={{ 
                      height: '44px',
                      fontSize: '14px',
                      paddingRight: inputMessage.trim() ? '52px' : '12px'
                    }}
                  />
                  
                  {inputMessage.trim() && (
                    <Button
                      onClick={handleSendMessage}
                      disabled={isLoading}
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary hover:bg-primary/10 flex-shrink-0 h-[36px] w-[36px]"
                      size="icon"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-3 px-4 py-2 gap-2 shrink-0">
              <button
                onClick={() => handleQuickAction("Consultar Informe 🚀")}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
              >
                Consultar Informe 🚀
              </button>

              <button
                onClick={() => handleQuickAction("Ver Leads ℹ️")}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
              >
                Ver Leads ℹ️
              </button>

              <button
                onClick={() => handleQuickAction("Ver Comisiones 📄")}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
              >
                Ver Comisiones 📄
              </button>
            </div>
                  
          </div>
        </div>
      )}
        </>
      </SettingsProvider>
    </ThemeProvider>
  );
}
