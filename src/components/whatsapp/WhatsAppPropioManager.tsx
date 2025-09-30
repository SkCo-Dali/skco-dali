import { useState } from 'react';
import { Lead } from '@/types/crm';
import { WhatsAppEntryModal } from './WhatsAppEntryModal';
import { ComposerWAPropio, SendConfig } from './ComposerWAPropio';
import { SendProgressModal } from './SendProgressModal';
import { MassWhatsAppSender } from '@/components/MassWhatsAppSender';
import { useWhatsAppPropio } from '@/hooks/useWhatsAppPropio';

type ViewMode = 'entry' | 'composer' | 'sami';

interface WhatsAppPropioManagerProps {
  leads: Lead[];
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function WhatsAppPropioManager({ 
  leads, 
  isOpen, 
  onClose,
  userEmail 
}: WhatsAppPropioManagerProps) {
  const [currentView, setCurrentView] = useState<ViewMode>('entry');
  
  const {
    sendProgress,
    sendEvents,
    isLoading,
    sendMessages,
    pauseResume,
    cancelSend,
    downloadReport
  } = useWhatsAppPropio();

  const handleSelectPropio = () => {
    setCurrentView('composer');
  };

  const handleSelectSami = () => {
    setCurrentView('sami');
  };

  const handleBackToEntry = () => {
    setCurrentView('entry');
  };

  const handleSendMessages = async (config: SendConfig) => {
    await sendMessages({
      message: config.message,
      attachments: config.attachments,
      leads: config.validLeads,
      throttle: config.throttle,
      dryRun: config.dryRun,
      userEmail
    });
  };

  const handleCloseProgress = () => {
    setCurrentView('composer');
  };

  const handleCloseSami = () => {
    onClose();
  };

  // Renderizado condicional basado en la vista actual
  if (currentView === 'entry') {
    return (
      <WhatsAppEntryModal
        isOpen={isOpen}
        onClose={onClose}
        onSelectPropio={handleSelectPropio}
        onSelectSami={handleSelectSami}
        leadsCount={leads.length}
      />
    );
  }

  if (currentView === 'composer') {
    return (
      <>
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <div className="container max-w-7xl mx-auto p-6">
            <ComposerWAPropio
              leads={leads}
              onBack={handleBackToEntry}
              onSend={handleSendMessages}
            />
          </div>
        </div>

        <SendProgressModal
          isOpen={sendProgress.isActive}
          progress={sendProgress}
          events={sendEvents}
          onPauseResume={pauseResume}
          onCancel={cancelSend}
          onClose={handleCloseProgress}
          onDownloadReport={downloadReport}
        />
      </>
    );
  }

  if (currentView === 'sami') {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-auto">
        <div className="container max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Envío por Sami WhatsApp</h1>
            <button
              onClick={handleCloseSami}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
          <MassWhatsAppSender
            filteredLeads={leads}
            onClose={handleCloseSami}
          />
        </div>
      </div>
    );
  }

  return null;
}