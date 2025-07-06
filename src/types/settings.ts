
export interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  autoSave: boolean;
  soundEffects: boolean;
}

export interface ConversationStats {
  totalMessages: number;
  totalConversations: number;
  averageResponseTime: number;
  mostUsedModel: string;
  totalTokensUsed: number;
}
