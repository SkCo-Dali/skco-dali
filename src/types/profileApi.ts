// API Types for User Profile

export interface PreferredNameResponse {
  preferredName: string;
}

export interface BasicProfile {
  preferredName: string;
  birthDate: string | null;
  gender: string | null;
  maritalStatus: string | null;
  childrenCount: number;
}

export interface ContactChannel {
  id?: string;
  channelType: string;
  countryCode: string | null;
  channelValue: string;
  isPrimary: boolean;
  isPublic: boolean;
  isWhatsAppForMassEmails: boolean;
}

export interface EmergencyContact {
  fullName: string;
  relationship: string;
  phone: string;
}

export interface ImportantDate {
  name: string;
  date: string;
  type: string;
}

export interface ProfessionalProfile {
  jobTitle: string | null;
  department: string | null;
  hireDate: string | null;
  managerName: string | null;
  specialization: string | null;
  monthlyGoals: string | null;
  workdayStart: string | null;
  workdayEnd: string | null;
}

export interface Address {
  street: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

export interface AlternateContact {
  alternateEmail: string | null;
  alternatePhone: string | null;
}

export interface AppPreferences {
  primaryActionCode: string;
  primaryActionRoute: string;
  emailSignatureHtml: string | null;
  quietHoursFrom: string | null;
  quietHoursTo: string | null;
}

export interface UserProfileResponse {
  basic: BasicProfile;
  contactChannels: ContactChannel[];
  emergencyContacts: EmergencyContact[];
  importantDates: ImportantDate[];
  professional: ProfessionalProfile;
  address: Address;
  alternateContact: AlternateContact;
  appPreferences: AppPreferences;
}

export interface UpdateBasicProfileRequest {
  preferredName: string;
  birthDate: string | null;
  gender: string | null;
  maritalStatus: string | null;
  childrenCount: number;
}

export interface UpdateContactChannelsRequest {
  channels: Omit<ContactChannel, 'id'>[];
}

export interface UpdateProfessionalRequest {
  jobTitle: string | null;
  department: string | null;
  hireDate: string | null;
  managerName: string | null;
  specialization: string | null;
  monthlyGoals: string | null;
  workdayStart: string | null;
  workdayEnd: string | null;
}

export interface UpdateAddressRequest {
  address: Address;
  alternate: AlternateContact;
}

export interface UpdateFamilyRequest {
  emergencyContacts: EmergencyContact[];
  importantDates: ImportantDate[];
}

export interface UpdatePreferencesRequest {
  primaryActionCode: string;
  primaryActionRoute: string;
  emailSignatureHtml: string | null;
  quietHoursFrom: string | null;
  quietHoursTo: string | null;
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
  quietHoursFrom: string | null;
  quietHoursTo: string | null;
}
