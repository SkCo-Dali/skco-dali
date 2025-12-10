import React, { createContext, useContext, useState } from 'react';

interface ChatSamiContextType {
  isChatSamiOpen: boolean;
  setIsChatSamiOpen: (open: boolean) => void;
}

const ChatSamiContext = createContext<ChatSamiContextType | undefined>(undefined);

export const ChatSamiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isChatSamiOpen, setIsChatSamiOpen] = useState(false);

  return (
    <ChatSamiContext.Provider value={{ isChatSamiOpen, setIsChatSamiOpen }}>
      {children}
    </ChatSamiContext.Provider>
  );
};

export const useChatSamiState = () => {
  const context = useContext(ChatSamiContext);
  if (context === undefined) {
    throw new Error('useChatSamiState must be used within a ChatSamiProvider');
  }
  return context;
};
