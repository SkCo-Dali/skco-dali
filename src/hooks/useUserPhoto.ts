
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { graphConfig } from '@/config/authConfig';

export const useUserPhoto = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Use refs to track what we've already processed
  const lastProcessedToken = useRef<string | null>(null);
  const lastProcessedUserId = useRef<string | null>(null);
  const hasFetchedOnce = useRef(false);
  
  const { accessToken, user } = useAuth();

  const fetchUserPhoto = useCallback(async () => {
    const currentToken = accessToken;
    const currentUserId = user?.id;
    
    if (!currentToken || !user) {
      console.log('❌ useUserPhoto: No access token or user available');
      return;
    }

    // Check if we've already processed this exact token and user combo
    if (lastProcessedToken.current === currentToken && 
        lastProcessedUserId.current === currentUserId && 
        hasFetchedOnce.current) {
      console.log('⏭️ useUserPhoto: Already processed this token/user combo, skipping');
      return;
    }

    console.log('🖼️ useUserPhoto: fetchUserPhoto called', {
      hasAccessToken: !!currentToken,
      hasUser: !!user,
      tokenChanged: lastProcessedToken.current !== currentToken,
      userChanged: lastProcessedUserId.current !== currentUserId,
      tokenPreview: currentToken ? currentToken.substring(0, 20) + '...' : 'null'
    });

    setLoading(true);
    lastProcessedToken.current = currentToken;
    lastProcessedUserId.current = currentUserId;
    
    try {
      console.log('🚀 useUserPhoto: Fetching user photo from Microsoft Graph', graphConfig.graphPhotoEndpoint);
      
      const photoResponse = await fetch(graphConfig.graphPhotoEndpoint, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
        },
      });

      console.log('📸 useUserPhoto: Photo response received', {
        status: photoResponse.status,
        statusText: photoResponse.statusText,
        headers: Object.fromEntries(photoResponse.headers.entries())
      });

      if (photoResponse.ok) {
        const photoBlob = await photoResponse.blob();
        console.log('📸 useUserPhoto: Photo blob received', {
          size: photoBlob.size,
          type: photoBlob.type
        });
        
        if (photoBlob.size > 0) {
          // Clean up previous photo URL
          if (photoUrl) {
            URL.revokeObjectURL(photoUrl);
          }
          
          const photoObjectUrl = URL.createObjectURL(photoBlob);
          setPhotoUrl(photoObjectUrl);
          console.log('✅ useUserPhoto: Photo URL created successfully');
        } else {
          console.log('⚠️ useUserPhoto: Photo blob is empty');
          setPhotoUrl(null);
        }
      } else {
        console.log('❌ useUserPhoto: Photo request failed', {
          status: photoResponse.status,
          statusText: photoResponse.statusText
        });
        
        try {
          const errorText = await photoResponse.text();
          console.log('❌ useUserPhoto: Error response body:', errorText);
        } catch (e) {
          console.log('❌ useUserPhoto: Could not read error response');
        }
        
        setPhotoUrl(null);
      }
      
      hasFetchedOnce.current = true;
    } catch (error) {
      console.log('💥 useUserPhoto: Error fetching user photo:', error);
      setPhotoUrl(null);
      hasFetchedOnce.current = true;
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to prevent unnecessary recreations

  useEffect(() => {
    console.log('🔄 useUserPhoto: Effect triggered', {
      hasAccessToken: !!accessToken,
      hasUser: !!user,
      userEmail: user?.email,
      tokenChanged: lastProcessedToken.current !== accessToken,
      userChanged: lastProcessedUserId.current !== user?.id
    });

    if (accessToken && user) {
      console.log('✅ useUserPhoto: Conditions met, checking if fetch needed');
      fetchUserPhoto();
    } else if (!accessToken || !user) {
      console.log('❌ useUserPhoto: No access token or user, resetting state');
      
      // Clean up photo URL
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
      
      setPhotoUrl(null);
      lastProcessedToken.current = null;
      lastProcessedUserId.current = null;
      hasFetchedOnce.current = false;
    }
  }, [accessToken, user, fetchUserPhoto]);

  const refetch = useCallback(() => {
    console.log('🔄 useUserPhoto: Manual refetch requested');
    lastProcessedToken.current = null;
    lastProcessedUserId.current = null;
    hasFetchedOnce.current = false;
    setPhotoUrl(null);
    if (accessToken && user) {
      fetchUserPhoto();
    }
  }, [accessToken, user, fetchUserPhoto]);

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
