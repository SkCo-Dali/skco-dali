
import { Lead } from './crm';

export interface LeadProfile {
  id: string;
  name: string;
  description: string;
  criteria: ProfileCriteria[];
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCriteria {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: string | number | string[] | number[];
  label: string;
}

export interface LeadProfilerProps {
  onProfileCreate?: (profile: LeadProfile) => void;
  onProfileUpdate?: (profile: LeadProfile) => void;
  onProfileDelete?: (profileId: string) => void;
  existingProfiles?: LeadProfile[];
  selectedLead?: Lead;
  onBack?: () => void;
}

export interface ProfileFormData {
  name: string;
  description: string;
  criteria: ProfileCriteria[];
}
