import { ENV } from '@/config/environment';
import {
  ApiCommissionPlan,
  ApiCommissionPlansListResponse,
  CreateCommissionPlanRequest,
  UpdateCommissionPlanRequest,
  DeleteCommissionPlanResponse
} from '@/types/commissionPlansApi';

const API_BASE_URL = `${ENV.CRM_API_BASE_URL}/api/commission-plans`;

// Helper function to get authorization headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // Try to get access token from SecureTokenManager
    const { SecureTokenManager } = await import('@/utils/secureTokenManager');
    const tokenData = SecureTokenManager.getToken();
    
    console.log('[Commission Plans API] 🔑 Token data retrieved:', {
      hasToken: !!tokenData?.token,
      tokenPreview: tokenData?.token ? `${tokenData.token.substring(0, 20)}...${tokenData.token.substring(tokenData.token.length - 20)}` : 'NO TOKEN',
      expiresAt: tokenData?.expiresAt ? new Date(tokenData.expiresAt).toISOString() : 'N/A',
      isExpired: tokenData ? tokenData.expiresAt < Date.now() : 'N/A'
    });
    
    if (tokenData && tokenData.token) {
      headers['Authorization'] = `Bearer ${tokenData.token}`;
      console.log('[Commission Plans API] ✅ Authorization header set');
    } else {
      console.warn('[Commission Plans API] ⚠️ NO TOKEN AVAILABLE - Authorization header NOT set');
    }
  } catch (error) {
    console.error('[Commission Plans API] ❌ Error getting access token:', error);
  }

  return headers;
};

// Helper function for API requests with retry
const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      // If successful or client error (4xx), return the response
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response;
      }
      
      // If server error (5xx) and we have retries left, continue
      if (i === retries - 1) {
        return response;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    } catch (error) {
      // Network error - retry if we have retries left
      if (i === retries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  
  throw new Error('Max retries exceeded');
};

// 1. List all Commission Plans
export const getCommissionPlans = async (): Promise<ApiCommissionPlansListResponse> => {
  try {
    console.log('[Commission Plans API] 📡 Fetching all commission plans from:', API_BASE_URL);
    const headers = await getAuthHeaders();
    
    console.log('[Commission Plans API] 📤 Request headers:', {
      ...headers,
      Authorization: headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 27)}...` : 'NOT SET'
    });
    
    const response = await fetchWithRetry(API_BASE_URL, { headers });
    
    console.log('[Commission Plans API] 📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Commission Plans API] ❌ Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Error fetching commission plans: ${response.statusText} - ${errorText}`);
    }
    
    const result: ApiCommissionPlansListResponse = await response.json();
    console.log('[Commission Plans API] ✅ Successfully fetched commission plans:', result);
    
    return result;
  } catch (error) {
    console.error('[Commission Plans API] Error fetching commission plans:', error);
    throw error;
  }
};

// 2. Create Commission Plan
export const createCommissionPlan = async (planData: CreateCommissionPlanRequest): Promise<ApiCommissionPlan> => {
  try {
    console.log('[Commission Plans API] Creating commission plan...', planData);
    const headers = await getAuthHeaders();
    
    const response = await fetchWithRetry(API_BASE_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(planData),
    });

    if (!response.ok) {
      throw new Error(`Error creating commission plan: ${response.statusText}`);
    }

    const result: ApiCommissionPlan = await response.json();
    console.log('[Commission Plans API] Successfully created commission plan:', result);
    
    return result;
  } catch (error) {
    console.error('[Commission Plans API] Error creating commission plan:', error);
    throw error;
  }
};

// 3. Update Commission Plan
export const updateCommissionPlan = async (id: string, planData: UpdateCommissionPlanRequest): Promise<ApiCommissionPlan> => {
  try {
    console.log('[Commission Plans API] Updating commission plan...', id, planData);
    const headers = await getAuthHeaders();
    
    const response = await fetchWithRetry(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(planData),
    });

    if (!response.ok) {
      throw new Error(`Error updating commission plan: ${response.statusText}`);
    }

    const result: ApiCommissionPlan = await response.json();
    console.log('[Commission Plans API] Successfully updated commission plan:', result);
    
    return result;
  } catch (error) {
    console.error('[Commission Plans API] Error updating commission plan:', error);
    throw error;
  }
};

// 4. Delete Commission Plan
export const deleteCommissionPlan = async (id: string): Promise<DeleteCommissionPlanResponse> => {
  try {
    console.log('[Commission Plans API] Deleting commission plan...', id);
    const headers = await getAuthHeaders();
    
    const response = await fetchWithRetry(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error deleting commission plan: ${response.statusText} - ${errorText}`);
    }

    const result: DeleteCommissionPlanResponse = await response.json();
    console.log('[Commission Plans API] Successfully deleted commission plan:', result);
    
    return result;
  } catch (error) {
    console.error('[Commission Plans API] Error deleting commission plan:', error);
    throw error;
  }
};