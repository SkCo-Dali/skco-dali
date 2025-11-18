import { useState, useEffect } from 'react';
import { UserProfile } from '@/types/userProfile';
import { useOnboarding } from './useOnboarding';
import { OnboardingData } from '@/types/onboarding';

const PROFILE_KEY = 'dali-user-profile';

export function useUserProfile() {
  const { data: onboardingData, saveData: saveOnboardingData } = useOnboarding();
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
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
    
    if (stored) {
      return { ...flattenedOnboarding, ...JSON.parse(stored) };
    }
    return flattenedOnboarding as UserProfile;
  });

  useEffect(() => {
    // Sync with onboarding data when it changes
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
    setProfile(prev => ({ ...prev, ...flattenedOnboarding }));
  }, [onboardingData]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    
    // Also update onboarding data if relevant fields changed
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
    localStorage.removeItem(PROFILE_KEY);
    setProfile(onboardingData as UserProfile);
  };

  return {
    profile,
    updateProfile,
    resetProfile,
  };
}
