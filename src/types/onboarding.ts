export interface OnboardingData {
  preferredName: string;
  whatsapp: {
    countryCode: string;
    phone: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    xTwitter?: string;
    tiktok?: string;
  };
  emailSignature?: string;
  primaryAction?: {
    label: string;
    route: string;
  };
  singleWish?: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  subtitle?: string;
  isRequired: boolean;
}

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}
