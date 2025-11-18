import { useState, useEffect } from 'react';
import { UserProfile } from '@/types/userProfile';
import { useOnboarding } from './useOnboarding';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingData } from '@/types/onboarding';

// Helper to safely cast gender to UserProfile type
const castGender = (gender: string | null | undefined): UserProfile['gender'] => {
  if (!gender) return undefined;
  const validGenders = ['male', 'female', 'other', 'prefer_not_to_say'];
  return validGenders.includes(gender.toLowerCase()) 
    ? (gender.toLowerCase() as UserProfile['gender']) 
    : undefined;
};

// Helper to safely cast marital status
const castMaritalStatus = (status: string | null | undefined): UserProfile['maritalStatus'] => {
  if (!status) return undefined;
  const validStatuses = ['single', 'married', 'divorced', 'widowed', 'other'];
  return validStatuses.includes(status.toLowerCase()) 
    ? (status.toLowerCase() as UserProfile['maritalStatus']) 
    : undefined;
};

export function useUserProfile() {
  const { data: onboardingData, saveData: saveOnboardingData } = useOnboarding();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    // Obtener datos solo del usuario autenticado (del API)
    const userDataFromAuth: Partial<UserProfile> = user ? {
      preferredName: user.preferredName || undefined,
      birthDate: user.birthDate || undefined,
      gender: castGender(user.gender),
      maritalStatus: castMaritalStatus(user.maritalStatus),
      numberOfChildren: user.childrenCount,
      countryCode: user.whatsappCountryCode || undefined,
      phone: user.whatsappPhone || undefined,
      emailSignature: user.emailSignatureHtml || undefined,
    } : {};
    
    const flattenedOnboarding = {
      ...onboardingData,
      countryCode: onboardingData.whatsapp?.countryCode,
      phone: onboardingData.whatsapp?.phone,
      facebook: onboardingData.socialMedia?.facebook,
      instagram: onboardingData.socialMedia?.instagram,
      linkedin: onboardingData.socialMedia?.linkedin,
      xTwitter: onboardingData.socialMedia?.xTwitter,
      tiktok: onboardingData.socialMedia?.tiktok,
    };
    
    // Priorizar datos del API sobre datos temporales del onboarding
    return { ...flattenedOnboarding, ...userDataFromAuth } as UserProfile;
  });

  useEffect(() => {
    // Sync with user auth data and onboarding data when they change
    const userDataFromAuth: Partial<UserProfile> = user ? {
      preferredName: user.preferredName || undefined,
      birthDate: user.birthDate || undefined,
      gender: castGender(user.gender),
      maritalStatus: castMaritalStatus(user.maritalStatus),
      numberOfChildren: user.childrenCount,
      countryCode: user.whatsappCountryCode || undefined,
      phone: user.whatsappPhone || undefined,
      emailSignature: user.emailSignatureHtml || undefined,
    } : {};
    
    const flattenedOnboarding = {
      ...onboardingData,
      countryCode: onboardingData.whatsapp?.countryCode,
      phone: onboardingData.whatsapp?.phone,
      facebook: onboardingData.socialMedia?.facebook,
      instagram: onboardingData.socialMedia?.instagram,
      linkedin: onboardingData.socialMedia?.linkedin,
      xTwitter: onboardingData.socialMedia?.xTwitter,
      tiktok: onboardingData.socialMedia?.tiktok,
    };
    
    // Priorizar datos del usuario autenticado sobre onboarding
    setProfile(prev => ({ ...prev, ...flattenedOnboarding, ...userDataFromAuth }));
  }, [onboardingData, user]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    // NO guardamos en localStorage, los datos deben actualizarse en el API
    
    // Sincronizar con onboarding data solo campos relevantes durante el onboarding
    const onboardingUpdates: Partial<OnboardingData> = {};
    
    if ('preferredName' in updates) {
      onboardingUpdates.preferredName = updates.preferredName;
    }
    
    if ('countryCode' in updates || 'phone' in updates) {
      onboardingUpdates.whatsapp = {
        countryCode: updates.countryCode || updated.countryCode || '',
        phone: updates.phone || updated.phone || '',
      };
    }
    
    const socialMediaFields = ['facebook', 'instagram', 'linkedin', 'xTwitter', 'tiktok'];
    if (socialMediaFields.some(field => field in updates)) {
      onboardingUpdates.socialMedia = {
        facebook: updated.facebook,
        instagram: updated.instagram,
        linkedin: updated.linkedin,
        xTwitter: updated.xTwitter,
        tiktok: updated.tiktok,
      };
    }
    
    if ('emailSignature' in updates) {
      onboardingUpdates.emailSignature = updates.emailSignature;
    }
    
    if ('primaryAction' in updates) {
      onboardingUpdates.primaryAction = updates.primaryAction;
    }
    
    if ('singleWish' in updates) {
      onboardingUpdates.singleWish = updates.singleWish;
    }
    
    if (Object.keys(onboardingUpdates).length > 0) {
      saveOnboardingData(onboardingUpdates);
    }
  };

  const resetProfile = () => {
    // NO usamos localStorage, los datos vienen del API
    setProfile({ ...onboardingData } as UserProfile);
  };

  return {
    profile,
    updateProfile,
    resetProfile,
  };
}
