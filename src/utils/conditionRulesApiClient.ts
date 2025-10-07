import { ENV } from '@/config/environment';
import { SecureTokenManager } from './secureTokenManager';
import { logSecure } from './secureLogger';
import {
  ApiConditionRule,
  ApiConditionRulesListResponse,
  CreateConditionRuleRequest,
  UpdateConditionRuleRequest,
  DeleteConditionRuleResponse,
  ConditionRulesQueryParams
} from '@/types/conditionRulesApi';

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
const buildQueryString = (params: ConditionRulesQueryParams): string => {
  const searchParams = new URLSearchParams();
  
  if (params.field_name) {
    searchParams.append('field_name', params.field_name);
  }
  
  if (params.operator) {
    searchParams.append('operator', params.operator);
  }
  
  if (params.logical_operator) {
    searchParams.append('logical_operator', params.logical_operator);
  }
  
  if (params.group_level !== undefined) {
    searchParams.append('group_level', String(params.group_level));
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
 * GET /api/commission-rules/{ruleId}/conditions
 * List all conditions for a commission rule
 */
export const getConditionRules = async (
  ruleId: string,
  params?: ConditionRulesQueryParams
): Promise<ApiConditionRulesListResponse> => {
  const queryString = params ? buildQueryString(params) : '';
  const url = `${API_BASE_URL}/api/commission-rules/${ruleId}/conditions${queryString}`;
  
  console.log('🔵 [GET CONDITIONS] Request:', { url, ruleId, params });
  
  const response = await fetchWithRetry(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  console.log('🔵 [GET CONDITIONS] Response Status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    console.error('🔴 [GET CONDITIONS] Error:', { status: response.status, errorData, url });
    logSecure.httpResponse(response.status, url, errorData);
    throw new Error(errorData.detail || `Failed to fetch conditions: ${response.status}`);
  }

  const responseData = await response.json();
  console.log('🟢 [GET CONDITIONS] Success:', { total: responseData.total, items: responseData.items.length });
  return responseData;
};

/**
 * POST /api/commission-rules/{ruleId}/conditions
 * Create a new condition for a commission rule
 */
export const createConditionRule = async (
  ruleId: string,
  conditionData: CreateConditionRuleRequest
): Promise<ApiConditionRule> => {
  const url = `${API_BASE_URL}/api/commission-rules/${ruleId}/conditions`;
  const headers = getAuthHeaders() as Record<string, string>;
  
  // Log detailed request information
  console.log('🔵 [CREATE CONDITION] Request Details:', {
    url,
    method: 'POST',
    ruleId,
    body: conditionData,
    headers: {
      ...headers,
      'Authorization': headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 20)}...` : 'NOT SET'
    }
  });
  
  logSecure.httpRequest('POST', url, headers, conditionData);
  
  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(conditionData),
  });

  console.log('🔵 [CREATE CONDITION] Response Status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    console.error('🔴 [CREATE CONDITION] Error Response:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      url
    });
    logSecure.httpResponse(response.status, url, errorData);
    throw new Error(errorData.detail || `Failed to create condition: ${response.status}`);
  }

  const responseData = await response.json();
  console.log('🟢 [CREATE CONDITION] Success Response:', responseData);
  logSecure.httpResponse(response.status, url, responseData);

  return responseData;
};

/**
 * PUT /api/commission-rules/{ruleId}/conditions/{conditionId}
 * Update an existing condition
 */
export const updateConditionRule = async (
  ruleId: string,
  conditionId: string,
  conditionData: UpdateConditionRuleRequest
): Promise<ApiConditionRule> => {
  const url = `${API_BASE_URL}/api/commission-rules/${ruleId}/conditions/${conditionId}`;
  const headers = getAuthHeaders() as Record<string, string>;
  
  // Log detailed request information
  console.log('🔵 [UPDATE CONDITION] Request Details:', {
    url,
    method: 'PUT',
    ruleId,
    conditionId,
    body: conditionData,
    headers: {
      ...headers,
      'Authorization': headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 20)}...` : 'NOT SET'
    }
  });
  
  logSecure.httpRequest('PUT', url, headers, conditionData);
  
  const response = await fetchWithRetry(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(conditionData),
  });

  console.log('🔵 [UPDATE CONDITION] Response Status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    console.error('🔴 [UPDATE CONDITION] Error Response:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      url
    });
    logSecure.httpResponse(response.status, url, errorData);
    throw new Error(errorData.detail || `Failed to update condition: ${response.status}`);
  }

  const responseData = await response.json();
  console.log('🟢 [UPDATE CONDITION] Success Response:', responseData);
  logSecure.httpResponse(response.status, url, responseData);

  return responseData;
};

/**
 * DELETE /api/commission-rules/{ruleId}/conditions/{conditionId}
 * Delete a condition by ID
 */
export const deleteConditionRule = async (
  ruleId: string,
  conditionId: string
): Promise<DeleteConditionRuleResponse> => {
  const url = `${API_BASE_URL}/api/commission-rules/${ruleId}/conditions/${conditionId}`;
  const headers = getAuthHeaders() as Record<string, string>;
  
  console.log('🔵 [DELETE CONDITION] Request:', {
    url,
    method: 'DELETE',
    ruleId,
    conditionId,
    headers: {
      ...headers,
      'Authorization': headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 20)}...` : 'NOT SET'
    }
  });
  
  const response = await fetchWithRetry(url, {
    method: 'DELETE',
    headers,
  });

  console.log('🔵 [DELETE CONDITION] Response Status:', response.status);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    console.error('🔴 [DELETE CONDITION] Error:', {
      status: response.status,
      statusText: response.statusText,
      errorData,
      url
    });
    throw new Error(errorData.detail || `Failed to delete condition: ${response.status}`);
  }

  const responseData = await response.json();
  console.log('🟢 [DELETE CONDITION] Success:', responseData);
  return responseData;
};
