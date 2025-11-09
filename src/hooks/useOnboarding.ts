import { useState, useCallback } from 'react';
import { OnboardingData } from '@/types/onboarding';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingApiClient } from '@/utils/onboardingApiClient';
import { OnboardingWelcomePayload } from '@/types/onboardingApi';

const ONBOARDING_KEY = 'dali_onboarding_completed';
const ONBOARDING_DATA_KEY = 'dali-onboarding-data';

export function useOnboarding() {
  const { accessToken } = useAuth();
  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    return localStorage.getItem(ONBOARDING_KEY) === 'true';
  });

  const [data, setData] = useState<Partial<OnboardingData>>(() => {
    const stored = localStorage.getItem(ONBOARDING_DATA_KEY);
    return stored ? JSON.parse(stored) : {};
  });

  const saveData = (newData: Partial<OnboardingData>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(updated));
  };

  const completeOnboarding = useCallback(async (finalData: OnboardingData): Promise<boolean> => {
    if (!accessToken) {
      console.error('No access token available');
      return false;
    }

    try {
      // Preparar payload según el contrato de la API
      const payload: OnboardingWelcomePayload = {
        preferredName: finalData.preferredName,
        whatsapp: {
          countryCode: finalData.whatsapp.countryCode,
          phone: finalData.whatsapp.phone,
        },
        socials: finalData.socialMedia ? {
          facebook: finalData.socialMedia.facebook,
          instagram: finalData.socialMedia.instagram,
          linkedin: finalData.socialMedia.linkedin,
          xTwitter: finalData.socialMedia.xTwitter,
          tiktok: finalData.socialMedia.tiktok,
        } : undefined,
        primaryAction: {
          code: finalData.primaryAction?.label || '',
          route: finalData.primaryAction?.route || '/dashboard',
        },
        emailSignatureHtml: finalData.emailSignature,
        singleWish: finalData.singleWish,
      };

      const response = await onboardingApiClient.submitWelcomeOnboarding(accessToken, payload);

      if (response.success) {
        localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(finalData));
        localStorage.setItem(ONBOARDING_KEY, 'true');
        setIsCompleted(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }, [accessToken]);

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    localStorage.removeItem(ONBOARDING_DATA_KEY);
    setIsCompleted(false);
    setData({});
  };

  return {
    isCompleted,
    data,
    saveData,
    completeOnboarding,
    resetOnboarding,
  };
}
