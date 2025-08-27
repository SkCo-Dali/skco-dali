import { useState, useEffect, useCallback, useRef } from 'react';
import { SessionService } from '@/services/sessionService';

interface SessionState {
  sessionToken: string | null;
  refreshToken: string | null;
  sessionId: string | null;
  expiresAt: string | null;
}

const HEARTBEAT_INTERVAL = 4 * 60 * 1000; // 4 minutes
const REFRESH_THRESHOLD = 60; // 60 seconds

export const useSessionManager = () => {
  const [sessionState, setSessionState] = useState<SessionState>({
    sessionToken: null,
    refreshToken: null,
    sessionId: null,
    expiresAt: null
  });
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);
  const isTabActive = useRef(true);

  // Clear session state
  const clearSession = useCallback(() => {
    setSessionState({
      sessionToken: null,
      refreshToken: null,
      sessionId: null,
      expiresAt: null
    });
    setIsSessionActive(false);
    
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  }, []);

  // Start session
  const startSession = useCallback(async (): Promise<boolean> => {
    try {
      const userAgent = navigator.userAgent;
      const response = await SessionService.startSession(undefined, userAgent);
      
      setSessionState({
        sessionToken: response.sessionToken,
        refreshToken: response.refreshToken,
        sessionId: response.sessionId,
        expiresAt: response.expiresAt
      });
      
      setIsSessionActive(true);
      return true;
    } catch (error) {
      console.error('Error starting session:', error);
      clearSession();
      return false;
    }
  }, [clearSession]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!sessionState.refreshToken) {
      console.warn('No refresh token available');
      return false;
    }

    try {
      const response = await SessionService.refreshSession(sessionState.refreshToken);
      
      setSessionState(prev => ({
        ...prev,
        sessionToken: response.sessionToken,
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt
      }));
      
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      // If refresh fails, try to start a new session
      return await startSession();
    }
  }, [sessionState.refreshToken, startSession]);

  // Heartbeat
  const performHeartbeat = useCallback(async () => {
    if (!sessionState.sessionToken || !isTabActive.current) {
      return;
    }

    try {
      const response = await SessionService.heartbeat(sessionState.sessionToken);
      
      // If session expires soon, refresh it
      if (response.secondsToExpiry <= REFRESH_THRESHOLD) {
        console.log('Session expiring soon, refreshing...');
        await refreshSession();
      }
    } catch (error: any) {
      console.error('Heartbeat failed:', error);
      
      // If 401, try to refresh
      if (error.message.includes('401')) {
        console.log('Session expired, attempting refresh...');
        const refreshed = await refreshSession();
        if (!refreshed) {
          console.log('Refresh failed, clearing session');
          clearSession();
        }
      }
    }
  }, [sessionState.sessionToken, refreshSession, clearSession]);

  // Start heartbeat timer
  const startHeartbeatTimer = useCallback(() => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
    }
    
    heartbeatTimer.current = setInterval(performHeartbeat, HEARTBEAT_INTERVAL);
  }, [performHeartbeat]);

  // Logout
  const endSession = useCallback(async () => {
    if (sessionState.sessionToken) {
      try {
        await SessionService.logout(sessionState.sessionToken);
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    clearSession();
  }, [sessionState.sessionToken, clearSession]);

  // Handle tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabActive.current = !document.hidden;
      
      if (isTabActive.current && isSessionActive) {
        // Tab became active, perform immediate heartbeat
        performHeartbeat();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isSessionActive, performHeartbeat]);

  // Start heartbeat when session becomes active
  useEffect(() => {
    if (isSessionActive && sessionState.sessionToken) {
      startHeartbeatTimer();
    } else if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }

    return () => {
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current);
      }
    };
  }, [isSessionActive, sessionState.sessionToken, startHeartbeatTimer]);

  return {
    sessionState,
    isSessionActive,
    startSession,
    endSession,
    refreshSession,
    getMySessions: SessionService.getMySessions
  };
};