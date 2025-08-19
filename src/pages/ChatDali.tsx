
import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { SimpleChatInterface } from "../components/SimpleChatInterface";
import { SidePanel } from "../components/SidePanel";
import { ChatActionsButton } from "../components/ChatActionsButton";
import { ThemeProvider } from "../contexts/ThemeContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useIsMobile, useIsMedium } from "../hooks/use-mobile";
import { Header } from "../components/Header";
import { ConversationHistoryModal } from "../components/ConversationHistoryModal";
import { PromptTemplates } from "../components/PromptTemplates";

const IndexContent = forwardRef<any, {}>((props, ref) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const isMobile = useIsMobile();
  const isMedium = useIsMedium();
  const chatInterfaceRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    handleBannerMessage: (automaticReply: string) => {
      if (chatInterfaceRef.current && chatInterfaceRef.current.handleBannerMessage) {
        chatInterfaceRef.current.handleBannerMessage(automaticReply);
      }
    }
  }));

  const handleNewChat = () => {
    if (chatInterfaceRef.current?.handleStartNewConversation) {
      chatInterfaceRef.current.handleStartNewConversation();
    }
  };

  const handleBannerMessage = (automaticReply: string) => {
    if (chatInterfaceRef.current?.handleBannerMessage) {
      chatInterfaceRef.current.handleBannerMessage(automaticReply);
    }
  };

  const handleTemplateSelect = (content: string) => {
    if (chatInterfaceRef.current?.setInputMessage) {
      chatInterfaceRef.current.setInputMessage(content);
    }
  };

  const handleSearchConversations = () => {
    setShowConversationModal(true);
  };

  const handleViewTemplates = () => {
    setShowTemplatesModal(true);
  };

  const handleSelectTemplate = (content: string) => {
    setShowTemplatesModal(false);
    handleTemplateSelect(content);
  };

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-background">

      {/* Header fijo en móvil */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b flex-shrink-0">
          <Header 
            onBannerMessage={handleBannerMessage}
            chatInterfaceRef={chatInterfaceRef}
          />
        </div>
      )}
      
      <SidePanel 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        hasActiveConversation={true}
        onBannerMessage={handleBannerMessage}
        onTemplateSelect={handleTemplateSelect}
      />
      
      {/* Main content */}
      <div className={`flex-1 flex w-full ${isMobile ? 'pt-20' : ''} min-h-0 overflow-hidden`}>
        
        {/* Botón de acciones */}
        <div className="fixed z-40 top-18 right-2">
          <ChatActionsButton
            onNewConversation={handleNewChat}
            onSearchConversations={handleSearchConversations}
            onViewTemplates={handleViewTemplates}
          />
        </div>
        
        {/* Chat interface - contenedor directo sin padding extra */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <SimpleChatInterface ref={chatInterfaceRef} />
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
    </div>
  );
});

IndexContent.displayName = 'IndexContent';

const ChatDali = forwardRef<any, {}>((props, ref) => {
  return (
    <ProtectedRoute>
      <ThemeProvider>
        <SettingsProvider>
          <IndexContent ref={ref} />
        </SettingsProvider>
      </ThemeProvider>
    </ProtectedRoute>
  );
});

ChatDali.displayName = 'ChatDali';

export default ChatDali;

