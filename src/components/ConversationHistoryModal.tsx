
import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { useSimpleConversation } from '../contexts/SimpleConversationContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ConversationSearchBar } from './conversation-history/ConversationSearchBar';
import { ConversationList } from './conversation-history/ConversationList';
import { azureConversationService } from '../services/azureConversationService';
import { useAuth } from '../contexts/AuthContext';

interface ConversationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationHistoryModal: React.FC<ConversationHistoryModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingConversationId, setLoadingConversationId] = useState<string | null>(null);
  const { user } = useAuth();
  const { 
    conversations, 
    loadConversation, 
    deleteConversation, 
    isLoading,
    loadConversationsList
  } = useSimpleConversation();

  // Load conversations when modal opens
  useEffect(() => {
    if (isOpen && conversations.length === 0) {
      loadConversationsList();
    }
  }, [isOpen, conversations.length, loadConversationsList]);

  // Simple search filter
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return conv.title.toLowerCase().includes(query) || 
           conv.lastMessage.toLowerCase().includes(query);
  });

  const handleLoadConversation = async (id: string) => {
    try {
      setLoadingConversationId(id);
      await loadConversation(id);
      onClose();
    } catch (error) {
      console.error('❌ Error loading conversation:', error);
    } finally {
      setLoadingConversationId(null);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      try {
        await deleteConversation(id);
      } catch (error) {
        console.error('❌ Error deleting conversation:', error);
      }
    }
  };

  const handleUpdateTitle = async (id: string, newTitle: string) => {
    if (!user?.email) return;
    
    try {
      // Find the conversation to update
      const conversation = conversations.find(c => c.id === id);
      if (!conversation) return;
      
      // Update via Azure API
      await azureConversationService.updateConversation(id, user.email, {
        title: newTitle,
        updatedAt: new Date().toISOString()
      });
      
      // Reload conversations list to reflect changes
      await loadConversationsList();
    } catch (error) {
      console.error('❌ Error updating conversation title:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Clear search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setLoadingConversationId(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[85vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="p-4 pb-4 border-b bg-gradient-to-r from-gray-50 to-slate-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Historial de Conversaciones
              </DialogTitle>
              <p className="text-sm text-gray-600 mt-1">
                Encuentra y continúa tus conversaciones anteriores
              </p>
            </div>
          </div>
        </DialogHeader>

        <ConversationSearchBar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filteredCount={filteredConversations.length}
          totalCount={conversations.length}
          isLoading={isLoading}
        />

        <ConversationList
          conversations={filteredConversations}
          currentConversationId={null}
          loadingConversationId={loadingConversationId}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onLoadConversation={handleLoadConversation}
          onDeleteConversation={handleDeleteConversation}
          onUpdateTitle={handleUpdateTitle}
          onClearSearch={handleClearSearch}
        />
      </DialogContent>
    </Dialog>
  );
};
