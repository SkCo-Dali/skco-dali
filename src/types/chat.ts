
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: Array<{
    name: string;
    size: number;
    type: string;
    url?: string; // Añadido para URLs de archivos de Azure
  }>;
  data?: Array<Record<string, any>>;
  chart?: {
    type: 'bar' | 'line' | 'pie' | 'area';
    data: Array<Record<string, any>>;
    xAxis?: string;
    yAxis?: string;
  };
  downloadLink?: {
    url: string;
    filename: string;
  };
  videoPreview?: {
    url: string;
    title: string;
    thumbnail?: string;
    duration?: string;
    platform?: string;
  };
  metadata?: {
    processingTime: number;
    model: string;
    tokensUsed: number;
    feedback?: 'positive' | 'negative';
    feedbackDate?: string;
  };
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    browserName?: string;
    browserVersion?: string;
    operatingSystem?: string;
    screenResolution?: string;
    language?: string;
    timezone?: string;
    ipAddress?: string;
    location?: {
      latitude?: number;
      longitude?: number;
      city?: string;
      country?: string;
      accuracy?: number;
    };
  };
}

export interface VideoPreview {
  url: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  platform?: string;
}
