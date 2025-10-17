
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useUserPhoto = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Use refs to track what we've already processed
  const lastProcessedToken = useRef<string | null>(null);
  const lastProcessedUserId = useRef<string | null>(null);
  const hasFetchedOnce = useRef(false);
  
  const { accessToken, user } = useAuth();

  useEffect(() => {
    console.log('🔄 useUserPhoto: Effect triggered', {
      hasAccessToken: !!accessToken,
      hasUser: !!user,
      userEmail: user?.email,
      tokenChanged: lastProcessedToken.current !== accessToken,
      userChanged: lastProcessedUserId.current !== user?.id
    });
    setPhotoUrl(user?.avatar || null);
    
  }, [accessToken, user]);

  const refetch = useCallback(() => {
    console.log('🔄 useUserPhoto: Manual refetch requested');
    setPhotoUrl(user?.avatar || null);
   
  }, [accessToken, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (photoUrl) {
        console.log('🧹 useUserPhoto: Cleaning up photo URL on unmount');
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, []);

  return { photoUrl, loading, refetch };
};
