
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
      console.log('🟢🟢🟢 ChatDali: handleBannerMessage called with:', automaticReply);
      if (chatInterfaceRef.current && chatInterfaceRef.current.handleBannerMessage) {
        console.log('🟢🟢🟢 ChatDali: Forwarding to SimpleChatInterface');
        chatInterfaceRef.current.handleBannerMessage(automaticReply);
      } else {
        console.log('🔴🔴🔴 ChatDali: SimpleChatInterface ref not available');
      }
    }
  }));

  const handleNewChat = () => {
    if (chatInterfaceRef.current && chatInterfaceRef.current.handleStartNewConversation) {
      chatInterfaceRef.current.handleStartNewConversation();
    }
  };

  const handleBannerMessage = (automaticReply: string) => {
    console.log('🟡🟡🟡 ChatDali: handleBannerMessage called with:', automaticReply);
    if (chatInterfaceRef.current && chatInterfaceRef.current.handleBannerMessage) {
      console.log('🟢🟢🟢 ChatDali: Forwarding banner message to SimpleChatInterface');
      chatInterfaceRef.current.handleBannerMessage(automaticReply);
    } else {
      console.log('🔴🔴🔴 ChatDali: SimpleChatInterface ref not available for banner message');
    }
  };

  const handleTemplateSelect = (content: string) => {
    console.log('🟢🟢🟢 ChatDali: handleTemplateSelect called with:', content);
    console.log('🟢🟢🟢 ChatDali: chatInterfaceRef.current exists:', !!chatInterfaceRef.current);
    
    if (chatInterfaceRef.current) {
      console.log('🟢🟢🟢 ChatDali: chatInterfaceRef.current.setInputMessage exists:', !!chatInterfaceRef.current.setInputMessage);
      console.log('🟢🟢🟢 ChatDali: About to call setInputMessage with:', content);
      
      if (chatInterfaceRef.current.setInputMessage) {
        chatInterfaceRef.current.setInputMessage(content);
        console.log('🟢🟢🟢 ChatDali: setInputMessage called successfully');
      } else {
        console.log('🔴🔴🔴 ChatDali: setInputMessage method not available on SimpleChatInterface ref');
      }
    } else {
      console.log('🔴🔴🔴 ChatDali: SimpleChatInterface ref not available for template');
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
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      
      {/* Header fijo en móvil */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white">
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
      
      {/* Main content con padding responsivo */}
      <div className={`flex flex-1 w-full h-full relative ${
        isMobile ? 'pt-20' : ''
      }`}>
        
        {/* Botón de acciones - Posicionamiento optimizado */}
        <div className={`fixed z-40 ${
          isMobile 
            ? 'top-18 right-2' // Reducido el margen derecho en móvil
            : isMedium 
              ? 'top-18 right-2'
              : 'top-18 right-2'
        }`}>
          <ChatActionsButton
            onNewConversation={handleNewChat}
            onSearchConversations={handleSearchConversations}
            onViewTemplates={handleViewTemplates}
          />
        </div>
        
        {/* Chat interface con padding lateral reducido en móvil */}
        <div className={`flex-1 flex flex-col w-full h-full ${
          isMobile || isMedium ? 'pt-10 px-4' : ' px-8'
        } ${isMobile ? 'pr-6' : ''}`} 
  style={{ paddingBottom: isMobile ? '20px' : '16px', maxWidth: isMobile ? '100%' : '1200px', margin: '0 auto' }}>
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
