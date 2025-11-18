export interface AvailableAction {
  code: string;
  label: string;
  route: string;
  icon: string;
  description: string;
}

export interface AvailableActionsResponse {
  actions: AvailableAction[];
}

export interface OnboardingWelcomePayload {
  preferredName: string;
  whatsapp: {
    countryCode: string;
    phone: string;
  };
  socials?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    xTwitter?: string;
    tiktok?: string;
  };
  primaryAction: {
    code: string;
    route: string;
  };
  emailSignatureHtml?: string;
  singleWish?: string;
}

export interface OnboardingWelcomeResponse {
  success: boolean;
  userId: string;
  onboardingCompleted: boolean;
}

export interface StartPageResponse {
  code: string;
  route: string;
}
