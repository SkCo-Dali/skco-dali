import { OnboardingData } from './onboarding';

// Extend onboarding data with additional profile fields
export interface UserProfile extends Omit<OnboardingData, 'whatsapp' | 'socialMedia'> {
  // Personal Information (from onboarding + additional)
  photo?: string;
  birthDate?: string;
  gender?: string;
  maritalStatus?: string;
  childrenCount?: number;
  
  // WhatsApp (flattened from onboarding)
  countryCode?: string;
  phone?: string;
  
  // Social Media (flattened from onboarding)
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  xTwitter?: string;
  tiktok?: string;
  
  // Professional Information
  jobTitle?: string;
  department?: string;
  hireDate?: string;
  managerName?: string;
  specialization?: string;
  monthlyGoals?: string;
  workdayStart?: string;
  workdayEnd?: string;
  
  // Family Information
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  
  // Contact Information (Address)
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  
  // Alternate Contact
  alternateEmail?: string;
  alternatePhone?: string;
  
  // Notification Preferences
  notificationPreferences?: {
    leads?: {
      enabled: boolean;
      channels: ('whatsapp' | 'email' | 'inapp')[];
      frequency: 'immediate' | 'daily' | 'weekly';
    };
    opportunities?: {
      enabled: boolean;
      channels: ('whatsapp' | 'email' | 'inapp')[];
      frequency: 'immediate' | 'daily' | 'weekly';
    };
    commissions?: {
      enabled: boolean;
      channels: ('whatsapp' | 'email' | 'inapp')[];
      frequency: 'immediate' | 'daily' | 'weekly';
    };
    tasks?: {
      enabled: boolean;
      channels: ('whatsapp' | 'email' | 'inapp')[];
      frequency: 'immediate' | 'daily' | 'weekly';
    };
    system?: {
      enabled: boolean;
      channels: ('whatsapp' | 'email' | 'inapp')[];
      frequency: 'immediate' | 'daily' | 'weekly';
    };
    quietHours?: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
  
  // Suggestions
  suggestions?: Array<{
    id: string;
    text: string;
    category: string;
    createdAt: string;
    status?: 'pending' | 'reviewed' | 'implemented';
  }>;
}

export interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  defaultEnabled: boolean;
}

export const notificationCategories: NotificationCategory[] = [
  {
    id: 'leads',
    label: 'Leads',
    description: 'Nuevos leads, cambios de estado, asignaciones',
    defaultEnabled: true,
  },
  {
    id: 'opportunities',
    label: 'Oportunidades',
    description: 'Nuevas oportunidades, actualizaciones importantes',
    defaultEnabled: true,
  },
  {
    id: 'commissions',
    label: 'Comisiones',
    description: 'Cambios en comisiones, nuevos pagos',
    defaultEnabled: true,
  },
  {
    id: 'tasks',
    label: 'Tareas',
    description: 'Recordatorios de tareas, vencimientos',
    defaultEnabled: true,
  },
  {
    id: 'system',
    label: 'Sistema',
    description: 'Actualizaciones del sistema, mantenimiento',
    defaultEnabled: false,
  },
];
