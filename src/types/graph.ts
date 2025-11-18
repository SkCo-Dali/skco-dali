/**
 * Tipos y interfaces para Microsoft Graph OAuth
 */

export interface GraphAuthState {
  userId: string;
  timestamp: number;
  returnPath?: string;
}

export interface GraphTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scopes: string[];
  accountEmail?: string;
}

export interface GraphAuthorizationStatus {
  isAuthorized: boolean;
  accountEmail?: string;
  authorizedAt?: string;
  scopes?: string[];
}

export interface GraphCodeExchangeRequest {
  code: string;
  redirectUri: string;
  userId: string;
  codeVerifier?: string; // Code verifier para PKCE
}

export interface GraphCodeExchangeResponse {
  success: boolean;
  accountEmail?: string;
}

export interface GraphTokenRefreshRequest {
  userId: string;
}

export interface GraphTokenRefreshResponse {
  accessToken: string;
  expiresAt: string;
}
