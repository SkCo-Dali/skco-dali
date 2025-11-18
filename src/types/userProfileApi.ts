export interface PreferredNameResponse {
  preferredName: string;
}

export interface ContactChannel {
  id: string;
  channelType: 'WhatsApp' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'X' | 'TikTok' | 'Email' | 'Phone';
  countryCode: string | null;
  channelValue: string;
  isPrimary: boolean;
  isPublic: boolean;
  isWhatsAppForMassEmails: boolean;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface ImportantDate {
  name: string;
  date: string;
  type: string;
}

export interface ProfessionalInfo {
  role?: string;
  department?: string;
  startDate?: string;
  manager?: string;
  specialization?: string;
  monthlyGoals?: string;
  workSchedule?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface AlternateContact {
  landline?: string;
  alternativeEmail?: string;
}

export interface AppPreferences {
  primaryActionCode?: string;
  primaryActionRoute?: string;
  emailSignatureHtml?: string;
  quietHoursFrom?: string;
  quietHoursTo?: string;
}

export interface ProfileResponse {
  basic: {
    preferredName: string;
    birthDate: string | null;
    gender: string | null;
    maritalStatus: string | null;
    childrenCount: number;
  };
  contactChannels: ContactChannel[];
  emergencyContacts: EmergencyContact[];
  importantDates: ImportantDate[];
  professional: ProfessionalInfo;
  address: Address;
  alternateContact: AlternateContact;
  appPreferences: AppPreferences;
}
