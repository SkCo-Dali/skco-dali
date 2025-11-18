import { PreferredNameResponse } from '@/types/userProfileApi';
import { ENV } from '@/config/environment';

const API_BASE_URL = ENV.CRM_API_BASE_URL;

class UserProfileApiClient {
  private async getAuthHeaders(token: string): Promise<HeadersInit> {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getPreferredName(token: string): Promise<PreferredNameResponse> {
    const response = await fetch(`${API_BASE_URL}/api/preferred-name`, {
      method: 'GET',
      headers: await this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching preferred name: ${response.statusText}`);
    }

    return response.json();
  }
}

export const userProfileApiClient = new UserProfileApiClient();
