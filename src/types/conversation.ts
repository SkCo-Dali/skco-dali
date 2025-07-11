
import { ChatMessage } from "./chat";

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isArchived: boolean;
  totalTokens: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

// Add Message type alias for backward compatibility
export type Message = ChatMessage;
