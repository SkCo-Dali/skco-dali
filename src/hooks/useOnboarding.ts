import { useState, useCallback } from 'react';
import { OnboardingData } from '@/types/onboarding';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingApiClient } from '@/utils/onboardingApiClient';
import { OnboardingWelcomePayload } from '@/types/onboardingApi';

export function useOnboarding() {
  const { accessToken } = useAuth();
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [data, setData] = useState<Partial<OnboardingData>>({});

  const saveData = (newData: Partial<OnboardingData>) => {
    const updated = { ...data, ...newData };
    setData(updated);
    // NO guardamos en localStorage, los datos vienen del API
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
        // NO guardamos en localStorage, los datos se obtienen del API
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
    // NO usamos localStorage
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
