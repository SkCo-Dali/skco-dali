import { ENV } from '@/config/environment';
import {
  PreferredNameResponse,
  UserProfileResponse,
  UpdateBasicProfileRequest,
  UpdateContactChannelsRequest,
  UpdateProfessionalRequest,
  UpdateAddressRequest,
  UpdateFamilyRequest,
  UpdatePreferencesRequest,
  NotificationsResponse,
  UpdateNotificationsRequest,
} from '@/types/profileApi';

const API_BASE_URL = ENV.CRM_API_BASE_URL;

class ProfileApiClient {
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

  async getProfile(token: string): Promise<UserProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/api/profile`, {
      method: 'GET',
      headers: await this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching profile: ${response.statusText}`);
    }

    return response.json();
  }

  async updateBasicProfile(token: string, data: UpdateBasicProfileRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/profile/basic`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error updating basic profile: ${response.statusText}`);
    }
  }

  async updateContactChannels(token: string, data: UpdateContactChannelsRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/profile/contact-channels`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error updating contact channels: ${response.statusText}`);
    }
  }

  async updateProfessional(token: string, data: UpdateProfessionalRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/profile/professional`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error updating professional profile: ${response.statusText}`);
    }
  }

  async updateAddress(token: string, data: UpdateAddressRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/profile/address`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error updating address: ${response.statusText}`);
    }
  }

  async updateFamily(token: string, data: UpdateFamilyRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/profile/family`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error updating family info: ${response.statusText}`);
    }
  }

  async updatePreferences(token: string, data: UpdatePreferencesRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/profile/preferences`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error updating preferences: ${response.statusText}`);
    }
  }

  async getNotifications(token: string): Promise<NotificationsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/profile/notifications`, {
      method: 'GET',
      headers: await this.getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`Error fetching notifications: ${response.statusText}`);
    }

    return response.json();
  }

  async updateNotifications(token: string, data: UpdateNotificationsRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/profile/notifications`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Error updating notifications: ${response.statusText}`);
    }
  }
}

export const profileApiClient = new ProfileApiClient();
