import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import { ChatActionsButton } from "../components/ChatActionsButton";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Minus, Lightbulb, Send, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { opportunitiesService } from "@/services/opportunitiesService";
import { IOpportunity } from "@/types/opportunities";
import { SimpleMessage } from "./SimpleMessage";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useSimpleConversation } from "@/contexts/SimpleConversationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { callAzureAgentApi } from "@/utils/azureApiService";
import { azureConversationService } from "@/services/azureConversationService";
import { ChatMessage } from "@/types/chat";
import { useIsMobile } from "@/hooks/use-mobile";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ConversationHistoryModal } from "./ConversationHistoryModal";
import { PromptTemplates } from "./PromptTemplates";

type ChatSamiProps = {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type ChatSamiHandle = {
  sendMessage: (message: string) => void;
};

type ViewMode = "hidden" | "minimized" | "maximized";

const ChatSamiContent = forwardRef<ChatSamiHandle, ChatSamiProps>(({ isOpen = false, onOpenChange }, ref) => {
  const [viewMode, setViewMode] = useState<ViewMode>("minimized");
  const [topOpportunity, setTopOpportunity] = useState<IOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [opportunityLoading, setOpportunityLoading] = useState(true);

  const { currentConversation, addMessage, createNewConversation, updateConversationId } = useSimpleConversation();
  const { user } = useAuth();
  const { aiSettings } = useSettings();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userEmail = user?.email || "";
  const messages = currentConversation?.messages || [];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<IOpportunity | null>(null);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const chatInterfaceRef = useRef<any>(null);

  const handleNewChat = () => {
    createNewConversation();
    setInputMessage("");
  };

  const handleBannerMessage = (automaticReply: string) => {
    if (chatInterfaceRef.current?.handleBannerMessage) {
      chatInterfaceRef.current.handleBannerMessage(automaticReply);
    }
  };

  const handleSearchConversations = () => {
    setShowConversationModal(true);
  };

  const handleViewTemplates = () => {
    setShowTemplatesModal(true);
  };

  const handleSelectTemplate = (content: string) => {
    setInputMessage(content);
    setShowTemplatesModal(false);
  };

  const handleViewOpportunityDetails = (opportunity: IOpportunity) => {
    setSelectedOpportunity(opportunity);
    setShowOpportunityModal(true);
  };

  const handleCloseOpportunityModal = () => {
    setShowOpportunityModal(false);
    setSelectedOpportunity(null);
  };

  // Crear conversación si no existe
  useEffect(() => {
    if (!currentConversation) {
      createNewConversation();
    }
  }, [currentConversation, createNewConversation]);

  // Genera un título “inteligente” desde el 1er mensaje del usuario (igual a Chat Dali)
  const generateConversationTitle = (message: string): string => {
    const cleanMessage = message.trim();
    if (cleanMessage.length <= 30) return cleanMessage;
    const firstSentence = cleanMessage.split(/[.!?]/)[0];
    if (firstSentence.length <= 50) return firstSentence.trim();
    const words = cleanMessage.split(" ");
    let title = "";
    for (const w of words) {
      if ((title + " " + w).length > 45) break;
      title = title ? `${title} ${w}` : w;
    }
    return title || cleanMessage.substring(0, 45);
  };

  // Flujo replicado de Chat Dali: crear/guardar en Azure -> llamar maestro -> guardar ambos mensajes
  const processSend = async (userMessage: ChatMessage, originalContent: string) => {
    console.group("%c🧠 ChatSami - Proceso de envío", "color:#16a34a;font-weight:bold");
    console.log("📩 userEmail:", userEmail);
    console.log("🆔 currentConversationId (local):", currentConversation?.id);
    console.log("💬 mensaje (preview 80):", originalContent.slice(0, 80));

    const isNewConversation = (messages?.length || 0) === 0;
    const conversationTitle = isNewConversation
      ? generateConversationTitle(originalContent)
      : currentConversation?.title || "Conversación";

    let conversationId = currentConversation?.id;

    try {
      if (isNewConversation) {
        console.log("📝 Creando nueva conversación en Azure...", { userEmail, conversationTitle });
        conversationId = await azureConversationService.createConversation(userEmail, conversationTitle);
        console.log("✅ Conversación creada en Azure con ID:", conversationId);
        updateConversationId(conversationId);
      } else {
        console.log("ℹ️ Usando conversación existente con ID:", conversationId);
      }

      // Guardar mensaje del usuario antes de llamar al maestro
      const messagesBeforeAssistant = [...(messages || []), userMessage];
      console.log("💾 Guardando mensaje del usuario en Azure...", {
        conversationId,
        count: messagesBeforeAssistant.length,
      });
      await azureConversationService.updateConversation(conversationId!, userEmail, {
        title: conversationTitle,
        messages: messagesBeforeAssistant.map((msg) => ({
          role: msg.type === "user" ? ("user" as const) : ("assistant" as const),
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          data: (msg as any).data,
          chart: (msg as any).chart,
          downloadLink: (msg as any).downloadLink,
          videoPreview: (msg as any).videoPreview,
          metadata: (msg as any).metadata,
        })),
        updatedAt: new Date().toISOString(),
      });
      console.log("✅ Mensaje del usuario guardado en Azure");

      // Llamar al maestro (lee por conversationId)
      console.log("📞 Llamando al agente maestro...", { conversationId, userEmail });
      const response = await callAzureAgentApi("", [], aiSettings, userEmail, conversationId);
      console.log("✅ Respuesta recibida del agente maestro");

      let aiResponseContent = "";
      if ((response as any).text) {
        aiResponseContent = (response as any).text;
      } else if ((response as any).data) {
        const d = (response as any).data;
        if (d.headers && d.rows) {
          aiResponseContent = `Se encontraron ${d.rows.length} registros con los siguientes campos: ${d.headers.join(", ")}`;
        } else {
          aiResponseContent = "Se procesaron los datos correctamente.";
        }
      } else {
        aiResponseContent = "Respuesta recibida del sistema.";
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: aiResponseContent,
        timestamp: new Date(),
        data: (response as any).data,
        chart: (response as any).chart,
        downloadLink: (response as any).downloadLink,
        videoPreview: (response as any).videoPreview,
      };

      addMessage(assistantMessage);

      const finalMessages = [...messagesBeforeAssistant, assistantMessage];
      console.log("💾 Actualizando conversación en Azure con ambos mensajes...", { total: finalMessages.length });
      await azureConversationService.updateConversation(conversationId!, userEmail, {
        title: conversationTitle,
        messages: finalMessages.map((msg) => ({
          role: msg.type === "user" ? ("user" as const) : ("assistant" as const),
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
          data: (msg as any).data,
          chart: (msg as any).chart,
          downloadLink: (msg as any).downloadLink,
          videoPreview: (msg as any).videoPreview,
          metadata: (msg as any).metadata,
        })),
        updatedAt: new Date().toISOString(),
      });
      console.log("✅ Conversación actualizada en Azure");
    } catch (error) {
      console.error("❌ Error en processSend:", error);
      throw error;
    } finally {
      console.groupEnd();
    }
  };

  // Función para enviar mensaje directamente (usado por el ref)
  const sendMessageDirectly = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !currentConversation) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent.trim(),
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setIsLoading(true);

    try {
      await processSend(userMessage, messageContent.trim());
    } catch (error) {
      console.error("Error al enviar mensaje (direct):", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Lo siento, hubo un error al procesar tu mensaje.",
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Exponer método para enviar mensajes desde fuera
  useImperativeHandle(ref, () => ({
    sendMessage: (message: string) => {
      // Abrir ChatSami si está cerrado
      if (!isOpen) {
        onOpenChange?.(true);
      }
      // Enviar el mensaje directamente
      sendMessageDirectly(message);
    },
  }));

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = isMobile ? 100 : 120;
      const minHeight = isMobile ? 40 : 44;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [inputMessage, isMobile]);

  // Scroll to bottom cuando hay nuevos mensajes
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Cargar oportunidad top 1
  useEffect(() => {
    const loadTopOpportunity = async () => {
      try {
        setOpportunityLoading(true);
        console.log("Cargando oportunidades...");
        const opportunities = await opportunitiesService.getOpportunities(undefined, "relevance");
        console.log("Oportunidades cargadas:", opportunities);
        if (opportunities.length > 0) {
          setTopOpportunity(opportunities[0]);
          console.log("Top oportunidad:", opportunities[0]);
        }
      } catch (error) {
        console.error("Error cargando oportunidad:", error);
      } finally {
        setOpportunityLoading(false);
      }
    };
    loadTopOpportunity();
  }, []);

  const quickActions = [
    "Consultar Informe 🚀",
    "Ver Leads ℹ️",
    "Ver Comisiones 📄",
    "Crear Tarea 📝",
    "Revisar Oportunidades 💡",
    "Estado de Proyectos 📊",
  ];

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
  };

  const handleViewOpportunity = () => {
    if (topOpportunity) {
      navigate(`/oportunidades/${topOpportunity.id}`);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentConversation) return;

    const messageContent = inputMessage.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: messageContent,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputMessage("");
    setIsLoading(true);

    try {
      await processSend(userMessage, messageContent);
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Lo siento, hubo un error al procesar tu mensaje.",
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToggle = (newState: boolean) => {
    onOpenChange?.(newState);
  };

  return (
    <>
      {/* Burbuja flotante */}
      {!isOpen && (
        <button
          onClick={() => handleToggle(true)}
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

      {/* Panel lateral fijo */}
      {isOpen && viewMode !== "maximized" && (
        <div className="fixed top-20 right-0 bottom-0 w-[360px] border-l bg-background shadow-none flex flex-col z-30">
          {/* Header */}
          <div className="flex items-center justify-end px-2 pt-2 bg-[#fafafa] h-20 shrink-0">
            <h2 className="text-lg font-semibold text-foreground">Dali</h2>
            <div className="flex items-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("maximized")}
                className="h-8 w-8 hover:bg-muted"
                aria-label="Maximizar"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={() => handleToggle(false)}
                className="h-8 w-8 hover:bg-muted"
                aria-label="Cerrar"
              >
                <Minus className="h-4 w-4" />
              </Button>*/}
              {/* Botón de acciones */}
              <ChatActionsButton
                onNewConversation={handleNewChat}
                onSearchConversations={handleSearchConversations}
                onViewTemplates={handleViewTemplates}
              />
            </div>
          </div>

          {/* Tip del día */}
          <div className="px-4 pb-4 space-y-3 shrink-0 border-b">
            <div className="flex items-center gap-2 bg-[#e8f5e9] rounded-full p-2">
              <div className="shrink-0 bg-black rounded-full p-1.5">
                <Lightbulb className="h-4 w-4 text-[#00c83c]" />
              </div>
              <span className="text-sm font-medium text-foreground">Oportunidad de hoy✨</span>
            </div>

            {opportunityLoading ? (
              <div className="space-y-2 border rounded-xl p-3">
                <p className="text-sm text-muted-foreground">Cargando oportunidad...</p>
              </div>
            ) : topOpportunity ? (
              <div className="space-y-2 border rounded-xl p-3">
                <p className="text-sm font-semibold text-foreground">{topOpportunity.title}</p>
                <p className="text-xs text-muted-foreground">
                  Comisiones Potenciales{" "}
                  <span className="font-semibold">
                    ${topOpportunity.metrics?.estimatedSales?.toLocaleString() || "N/A"}
                  </span>
                </p>
                <button
                  onClick={handleViewOpportunity}
                  className="w-full text-sm text-center text-secondary font-medium hover:underline"
                >
                  Ver Oportunidad
                </button>
              </div>
            ) : (
              <div className="space-y-2 border rounded-xl p-3">
                <p className="text-sm text-muted-foreground">No hay oportunidades disponibles</p>
              </div>
            )}
          </div>

          {/* Chat Dali */}
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Messages area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Hola, ¡Qué gusto volver a hablar contigo!</p>
                </div>
              ) : (
                messages.map((msg) => <SimpleMessage key={msg.id} message={msg} />)
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Acciones rápidas 
            <div className="px-2 py-2 shrink-0">
              <div className="relative group">
                <Carousel className="px-4 w-full" opts={{ slidesToScroll: 1, align: "start", loop: true }}>
                  <CarouselContent className="-ml-2">
                    {quickActions.map((action, index) => (
                      <CarouselItem key={index} className="pl-2 basis-1/2">
                        <button
                          onClick={() => handleQuickAction(action)}
                          className="w-full h-20 text-center px-2 py-2 text-xs text-muted-foreground bg-muted rounded-lg border transition-colors hover:bg-muted/80 whitespace-nowrap overflow-hidden text-ellipsis"
                        >
                          {action}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>

                  
                  <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 h-7 w-7" />
                  <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 h-7 w-7" />
                </Carousel>
              </div>
            </div>*/}

            {/* Input area */}
            <div className="p-3 border-t shrink-0">
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
                    height: "44px",
                    fontSize: "14px",
                    paddingRight: inputMessage.trim() ? "52px" : "12px",
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
        </div>
      )}

      {/* Diálogo flotante maximizado */}

      {viewMode === "maximized" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col h-[85vh] w-[90vw] max-w-4xl bg-background rounded-xl shadow-2xl overflow-hidden border">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#fafafa] shrink-0">
              <h2 className="text-lg font-semibold text-foreground">Dali</h2>
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
                {/* Botón de acciones */}
                <ChatActionsButton
                  onNewConversation={handleNewChat}
                  onSearchConversations={handleSearchConversations}
                  onViewTemplates={handleViewTemplates}
                />
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
                  <p className="text-sm font-semibold text-foreground">{topOpportunity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Comisiones Potenciales{" "}
                    <span className="font-semibold">
                      ${topOpportunity.metrics?.estimatedSales?.toLocaleString() || "N/A"}
                    </span>
                  </p>
                  <button
                    onClick={handleViewOpportunity}
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
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-muted-foreground">Hola, ¡Qué gusto volver a hablar contigo!</p>
                  </div>
                ) : (
                  messages.map((msg) => <SimpleMessage key={msg.id} message={msg} />)
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Acciones rápidas 
              <div className="px-2 py-2 shrink-0">
                <Carousel
                  className="px-4 w-full relative group"
                  opts={{ slidesToScroll: 1, align: "start", loop: true }}
                >
                  <CarouselContent className="-ml-2 px-10">
                    {quickActions.map((action, index) => (
                      <CarouselItem key={index} className="pl-2 basis-1/3">
                        <button
                          onClick={() => handleQuickAction(action)}
                          className="w-full text-center px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
                        >
                          {action}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="absolute -left-2 top-1/2 -translate-y-1/2 h-8 w-8" />
                  <CarouselNext className="absolute -right-2 top-1/2 -translate-y-1/2 h-8 w-8" />
                </Carousel>
              </div>*/}
            </div>

            {/* Input area */}
            <div className="p-4 border-0">
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
                    height: "44px",

                    fontSize: "14px",

                    paddingRight: inputMessage.trim() ? "52px" : "12px",
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
        </div>
      )}

      {/* Modal de historial de conversaciones */}
      <ConversationHistoryModal isOpen={showConversationModal} onClose={() => setShowConversationModal(false)} />

      {/* Modal de plantillas */}
      <Dialog open={showTemplatesModal} onOpenChange={setShowTemplatesModal}>
        <DialogContent className="max-w-4xl w-full h-[85vh] p-0">
          <PromptTemplates onSelectTemplate={handleSelectTemplate} onClose={() => setShowTemplatesModal(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
});

ChatSamiContent.displayName = "ChatSamiContent";

const ChatSami = forwardRef<ChatSamiHandle, ChatSamiProps>((props, ref) => {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <ChatSamiContent {...props} ref={ref} />
      </SettingsProvider>
    </ThemeProvider>
  );
});

ChatSami.displayName = "ChatSami";

export default ChatSami;
