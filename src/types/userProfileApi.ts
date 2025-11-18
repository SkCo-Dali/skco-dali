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

// PUT request types
export interface UpdateBasicRequest {
  preferredName?: string;
  birthDate?: string | null;
  gender?: string | null;
  maritalStatus?: string | null;
  childrenCount?: number;
}

export interface UpdateContactChannelsRequest {
  channels: Array<{
    channelType: ContactChannel['channelType'];
    countryCode?: string | null;
    channelValue: string;
    isPrimary: boolean;
    isPublic: boolean;
    isWhatsAppForMassEmails: boolean;
  }>;
}

export interface UpdateProfessionalRequest {
  jobTitle?: string | null;
  department?: string | null;
  hireDate?: string | null;
  managerName?: string | null;
  specialization?: string | null;
  monthlyGoals?: string | null;
  workdayStart?: string | null;
  workdayEnd?: string | null;
}

export interface UpdateAddressRequest {
  address: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  };
  alternate: {
    alternateEmail?: string | null;
    alternatePhone?: string | null;
  };
}

export interface UpdateFamilyRequest {
  emergencyContacts: Array<{
    fullName: string;
    relationship: string;
    phone: string;
  }>;
  importantDates: Array<{
    name: string;
    date: string;
    type: string;
  }>;
}

export interface UpdatePreferencesRequest {
  primaryActionCode?: string | null;
  primaryActionRoute?: string | null;
  emailSignatureHtml?: string | null;
  quietHoursFrom?: string | null;
  quietHoursTo?: string | null;
}

export interface NotificationCategory {
  code: string;
  name: string;
  description: string;
  isEnabled: boolean;
}

export interface NotificationsResponse {
  items: NotificationCategory[];
  quietHoursFrom: string | null;
  quietHoursTo: string | null;
}

export interface UpdateNotificationsRequest {
  items: Array<{
    code: string;
    isEnabled: boolean;
  }>;
  quietHoursFrom?: string | null;
  quietHoursTo?: string | null;
}
