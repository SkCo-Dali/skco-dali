import { InAppMessage, InAppMessagesParams, InAppEvent } from '@/types/inAppMessaging';
import { 
  AvailableActionsResponse, 
  OnboardingWelcomePayload, 
  OnboardingWelcomeResponse 
} from '@/types/onboardingApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const APP_VERSION = '1.0.0';

class OnboardingApiClient {
  private async getAuthHeaders(token: string): Promise<HeadersInit> {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getInAppMessages(
    token: string, 
    params: InAppMessagesParams
  ): Promise<InAppMessage[]> {
    const queryParams = new URLSearchParams({
      context: params.context,
      ...(params.route && { route: params.route }),
      ...(params.app_version && { app_version: params.app_version }),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/inapp/messages?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: await this.getAuthHeaders(token),
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching in-app messages: ${response.statusText}`);
    }

    return response.json();
  }

  async registerInAppEvent(token: string, event: InAppEvent): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/inapp/events`, {
      method: 'POST',
      headers: await this.getAuthHeaders(token),
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      console.error('Error registering in-app event:', response.statusText);
    }
  }

  async getAvailableActions(token: string): Promise<AvailableActionsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/onboarding/available-actions`, {
      method: 'GET',
      headers: await this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching available actions: ${response.statusText}`);
    }

    return response.json();
  }

  async submitWelcomeOnboarding(
    token: string, 
    payload: OnboardingWelcomePayload
  ): Promise<OnboardingWelcomeResponse> {
    const response = await fetch(`${API_BASE_URL}/api/onboarding/welcome`, {
      method: 'POST',
      headers: await this.getAuthHeaders(token),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || `Error submitting onboarding: ${response.statusText}`);
    }

    return response.json();
  }
}

export const onboardingApiClient = new OnboardingApiClient();
