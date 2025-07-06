
export interface ApiBannerResponse {
  Id: number;
  CutOffDate: string;
  Email: string;
  MessageOrder: number;
  Title: string;
  MessageText: string;
  IconLink: string | null;
  ButtonText: string;
  AutomaticReply: string;
  HEXBubbleColor: string;
}

export interface BannerData {
  id: string;
  messageOrder: number;
  title: string;
  message: string;
  iconUrl?: string;
  buttonText: string;
  automaticReply: string;
  backgroundColor: string;
  textColor: string;
}

export interface UserBannerConfig {
  userId: string;
  enabled: boolean;
  rotationInterval: number; // seconds
  maxBanners: number;
}
