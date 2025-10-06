import { ENV } from '@/config/environment';
import { SecureTokenManager } from './secureTokenManager';
import {
  ApiCommissionRule, 
  ApiCommissionRulesListResponse, 
  CreateCommissionRuleRequest,
  DeleteCommissionRuleResponse,
  CommissionRulesQueryParams
} from '@/types/commissionRulesApi';

const API_BASE_URL = ENV.CRM_API_BASE_URL;

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const tokenData = SecureTokenManager.getToken();
  const token = tokenData?.token || '';
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

// Fetch with retry logic
const fetchWithRetry = async (url: string, options?: RequestInit, retries = 3): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    // Retry on server errors (5xx) or network issues
    if (!response.ok && response.status >= 500 && retries > 0) {
      console.warn(`Request failed with status ${response.status}, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return fetchWithRetry(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn('Network error, retrying...', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

/**
 * Build query string from params
 */
const buildQueryString = (params: CommissionRulesQueryParams): string => {
  const searchParams = new URLSearchParams();
  
  if (params.is_active !== undefined) {
    searchParams.append('is_active', String(params.is_active));
  }
  
  if (params.catalog && params.catalog.length > 0) {
    params.catalog.forEach(cat => searchParams.append('catalog', cat));
  }
  
  if (params.owner_name) {
    searchParams.append('owner_name', params.owner_name);
  }
  
  if (params.search) {
    searchParams.append('search', params.search);
  }
  
  if (params.page) {
    searchParams.append('page', String(params.page));
  }
  
  if (params.page_size) {
    searchParams.append('page_size', String(params.page_size));
  }
  
  if (params.order_by) {
    searchParams.append('order_by', params.order_by);
  }
  
  if (params.order_dir) {
    searchParams.append('order_dir', params.order_dir);
  }
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * GET /api/commission-plans/{planId}/rules
 * List all rules for a commission plan
 */
export const getCommissionRules = async (
  planId: string, 
  params?: CommissionRulesQueryParams
): Promise<ApiCommissionRulesListResponse> => {
  const queryString = params ? buildQueryString(params) : '';
  const url = `${API_BASE_URL}/api/commission-plans/${planId}/rules${queryString}`;
  
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `Failed to fetch rules: ${response.status}`);
  }

  return response.json();
};

/**
 * POST /api/commission-plans/{planId}/rules
 * Create a new rule for a commission plan
 */
export const createCommissionRule = async (
  planId: string,
  ruleData: CreateCommissionRuleRequest
): Promise<ApiCommissionRule> => {
  const url = `${API_BASE_URL}/api/commission-plans/${planId}/rules`;
  
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(ruleData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `Failed to create rule: ${response.status}`);
  }

  return response.json();
};

/**
 * GET /api/commission-rules/{ruleId}
 * Get a specific rule by ID
 */
export const getCommissionRuleById = async (ruleId: string): Promise<ApiCommissionRule> => {
  const url = `${API_BASE_URL}/api/commission-rules/${ruleId}`;
  
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `Failed to fetch rule: ${response.status}`);
  }

  return response.json();
};

/**
 * DELETE /api/commission-rules/{ruleId}
 * Delete a specific rule by ID
 */
export const deleteCommissionRule = async (ruleId: string): Promise<DeleteCommissionRuleResponse> => {
  const url = `${API_BASE_URL}/api/commission-rules/${ruleId}`;
  
  const response = await fetchWithRetry(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `Failed to delete rule: ${response.status}`);
  }

  return response.json();
};
