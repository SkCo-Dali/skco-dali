
import { useState, forwardRef, useImperativeHandle, useRef } from "react";
import { SimpleChatInterface } from "../components/SimpleChatInterface";
import { SidePanel } from "../components/SidePanel";
import { ChatActionsButton } from "../components/ChatActionsButton";
import { ThemeProvider } from "../contexts/ThemeContext";
import { SettingsProvider } from "../contexts/SettingsContext";
import { useIsMobile, useIsMedium } from "../hooks/use-mobile";
import { Header } from "../components/Header";
import { ConversationHistoryModal } from "../components/ConversationHistoryModal";
import { PromptTemplates } from "../components/PromptTemplates";
import { OpportunityHighlights } from "../components/opportunities/OpportunityHighlights";
import { OpportunityDetailsModal } from "../components/opportunities/OpportunityDetailsModal";
import { IOpportunity } from "../types/opportunities";
import { AccessDenied } from "../components/AccessDenied";
import { usePageAccess } from "../hooks/usePageAccess";

const IndexContent = forwardRef<any, {}>((props, ref) => {
  const { hasAccess } = usePageAccess("ChatDali");

  if (!hasAccess) {
    return <AccessDenied />;
  }
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<IOpportunity | null>(null);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
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

  const handleViewOpportunityDetails = (opportunity: IOpportunity) => {
    setSelectedOpportunity(opportunity);
    setShowOpportunityModal(true);
  };

  const handleCloseOpportunityModal = () => {
    setShowOpportunityModal(false);
    setSelectedOpportunity(null);
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-gray-900 flex flex-col overflow-hidden">

      {/* Header fijo en móvil */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white">
          <Header 
            onBannerMessage={handleBannerMessage}
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
      <div className={`flex flex-1 w-full relative ${isMobile ? 'pt-20' : ''} min-h-0 overflow-hidden`}>
        
        {/* Botón de acciones */}
        <div className="fixed z-40 top-18 right-2">
          <ChatActionsButton
            onNewConversation={handleNewChat}
            onSearchConversations={handleSearchConversations}
            onViewTemplates={handleViewTemplates}
          />
        </div>
        
        {/* Chat interface */}
        <div 
          className={`flex-1 flex flex-col w-full h-full min-h-0 overflow-hidden
            ${isMobile || isMedium ? 'pt-10 px-4' : 'px-5'}
            ${isMobile ? 'pr-6' : ''}`} 
          style={{ 
            paddingBottom: isMobile ? '20px' : '16px',
            maxWidth: isMobile ? '100%' : '1200px',
            margin: '0 auto'
          }}
        >
         {/* Market Dali Opportunities 
          <OpportunityHighlights onViewDetails={handleViewOpportunityDetails} />*/}
          
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
          <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] overflow-hidden">
            <PromptTemplates
              onSelectTemplate={handleSelectTemplate}
              onClose={() => setShowTemplatesModal(false)}
            />
          </div>
        </div>
      )}

      {/* Opportunity Details Modal */}
      <OpportunityDetailsModal
        opportunity={selectedOpportunity}
        isOpen={showOpportunityModal}
        onClose={handleCloseOpportunityModal}
      />
    </div>
  );
});

IndexContent.displayName = 'IndexContent';

const ChatDali = forwardRef<any, {}>((props, ref) => {
  return (
      <ThemeProvider>
        <SettingsProvider>
          <IndexContent ref={ref} />
        </SettingsProvider>
      </ThemeProvider>
  );
});

ChatDali.displayName = 'ChatDali';

export default ChatDali;

