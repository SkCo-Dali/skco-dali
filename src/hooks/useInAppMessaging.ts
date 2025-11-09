import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingApiClient } from '@/utils/onboardingApiClient';
import { InAppMessage, InAppMessagesParams, InAppEvent } from '@/types/inAppMessaging';

const ONBOARDING_MESSAGE_ID = 'cmp_onboarding_welcome_v1';

export function useInAppMessaging() {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<InAppMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async (params: InAppMessagesParams) => {
    if (!accessToken) return;

    setLoading(true);
    try {
      const data = await onboardingApiClient.getInAppMessages(accessToken, params);
      setMessages(data);
      return data;
    } catch (error) {
      console.error('Error fetching in-app messages:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const registerEvent = useCallback(async (event: InAppEvent) => {
    if (!accessToken) return;

    try {
      await onboardingApiClient.registerInAppEvent(accessToken, event);
    } catch (error) {
      console.error('Error registering in-app event:', error);
    }
  }, [accessToken]);

  const checkOnboardingRequired = useCallback(async (route: string = '/'): Promise<boolean> => {
    if (!accessToken) return false;

    // NO verificar localStorage - confiar en la respuesta del API
    // El API sabe si el usuario ya completó el onboarding en el backend
    try {
      const messages = await fetchMessages({ 
        context: 'login', 
        route,
        app_version: '1.0.0'
      });

      const onboardingMsg = messages?.find(
        m => m.id === ONBOARDING_MESSAGE_ID && m.mandatory
      );

      return !!onboardingMsg;
    } catch (error) {
      console.error('Error checking onboarding:', error);
      return false;
    }
  }, [accessToken, fetchMessages]);

  return {
    messages,
    loading,
    fetchMessages,
    registerEvent,
    checkOnboardingRequired,
  };
}
