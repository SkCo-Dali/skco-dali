
import React from 'react';
import { ConversationHistoryModal } from './ConversationHistoryModal';

interface ConversationHistoryProps {
  onClose: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({ onClose }) => {
  return (
    <div className="h-full">
      <ConversationHistoryModal isOpen={true} onClose={onClose} />
    </div>
  );
};
