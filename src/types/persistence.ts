
// Types for persistence layer
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  metadata?: {
    department?: string;
    role?: string;
    preferences?: Record<string, any>;
  };
}

export interface MessageFeedback {
  id: string;
  messageId: string;
  conversationId: string;
  userId: string;
  feedback: 'positive' | 'negative';
  comment?: string;
  createdAt: Date;
}

export interface SessionMetrics {
  id: string;
  userId: string;
  conversationId: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  tokensUsed: number;
  apiCalls: number;
  avgResponseTime: number;
}

export interface ConversationDocument {
  id: string;
  userId: string;
  title: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isArchived: boolean;
  totalTokens: number;
  metadata?: {
    source?: string;
    version?: number;
  };
}

export interface TemplateDocument {
  id: string;
  userId: string;
  name: string;
  description: string;
  content: string;
  category: string;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
  usageCount: number;
  tags: string[];
}

export interface ConfigurationDocument {
  id: string;
  userId: string;
  type: 'ai' | 'app' | 'user';
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventLog {
  id: string;
  userId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
  conversationId?: string;
}

export interface BlobFile {
  id: string;
  conversationId: string;
  messageId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  blobUrl: string;
  uploadedAt: Date;
  userId: string;
}
