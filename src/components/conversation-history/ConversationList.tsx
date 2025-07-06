
import React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { ConversationCard } from './ConversationCard';
import { ConversationEmptyState } from './ConversationEmptyState';

interface ConversationListProps {
  conversations: Array<{
    id: string;
    title: string;
    lastMessage: string;
    messageCount: number;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  }>;
  currentConversationId?: string;
  loadingConversationId: string | null;
  isLoading: boolean;
  searchQuery: string;
  onLoadConversation: (id: string) => void;
  onDeleteConversation: (e: React.MouseEvent, id: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onClearSearch: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversationId,
  loadingConversationId,
  isLoading,
  searchQuery,
  onLoadConversation,
  onDeleteConversation,
  onUpdateTitle,
  onClearSearch
}) => {
  if (isLoading || conversations.length === 0) {
    return (
      <div className="flex-1 min-h-0 overflow-hidden">
        <ConversationEmptyState
          searchQuery={searchQuery}
          isLoading={isLoading}
          onClearSearch={onClearSearch}
        />
      </div>
    );
  }

  // Sort conversations by updatedAt in descending order (most recent first)
  const sortedConversations = [...conversations].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-4">
          {sortedConversations.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              isActive={currentConversationId === conversation.id}
              isLoading={loadingConversationId === conversation.id}
              onLoad={onLoadConversation}
              onDelete={onDeleteConversation}
              onUpdateTitle={onUpdateTitle}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
