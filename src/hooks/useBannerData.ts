
import { useState, useEffect, useRef } from 'react';
import { BannerData, ApiBannerResponse } from '../types/banner';
import { useAuth } from '../contexts/AuthContext';
import { azureConversationService } from '../services/azureConversationService';

// Helper function to determine text color based on background color
const getTextColor = (hexColor: string): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, dark for light backgrounds
  return luminance > 0.5 ? '#1f2937' : '#ffffff';
};

// Transform API response to internal format
const transformApiBanner = (apiBanner: ApiBannerResponse): BannerData => ({
  id: apiBanner.Id.toString(),
  messageOrder: apiBanner.MessageOrder,
  title: apiBanner.Title,
  message: apiBanner.MessageText,
  iconUrl: apiBanner.IconLink || undefined,
  buttonText: apiBanner.ButtonText,
  automaticReply: apiBanner.AutomaticReply,
  backgroundColor: apiBanner.HEXBubbleColor,
  textColor: getTextColor(apiBanner.HEXBubbleColor)
});

export const useBannerData = () => {
  const { user } = useAuth();
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use refs to track if we've already fetched for this user
  const lastFetchedEmail = useRef<string | null>(null);
  const hasFetchedOnce = useRef(false);

  // Fetch banners from Azure API only when user email changes or on first load
  useEffect(() => {
    const currentEmail = user?.email;
    
    // Skip if no email or already fetched for this email
    if (!currentEmail || lastFetchedEmail.current === currentEmail) {
      if (!currentEmail) {
        setIsLoading(false);
        setBanners([]);
        lastFetchedEmail.current = null;
        hasFetchedOnce.current = false;
      }
      return;
    }

    setIsLoading(true);
    lastFetchedEmail.current = currentEmail;

    const fetchBanners = async () => {
      try {
        const apiResponse = await azureConversationService.getUserBanners(currentEmail);
        
        // Handle both single banner object and array of banners
        let bannersArray: ApiBannerResponse[];
        
        if (Array.isArray(apiResponse)) {
          bannersArray = apiResponse;
        } else if (apiResponse && typeof apiResponse === 'object') {
          // If it's a single banner object, wrap it in an array
          bannersArray = [apiResponse as ApiBannerResponse];
        } else {
          bannersArray = [];
        }
        
        // Sort by MessageOrder and transform
        const sortedBanners = bannersArray
          .sort((a, b) => a.MessageOrder - b.MessageOrder)
          .map(transformApiBanner);
        
        setBanners(sortedBanners);
        setCurrentBannerIndex(0);
        hasFetchedOnce.current = true;
      } catch (error) {
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [user?.email]); // Keep dependency but use ref to prevent unnecessary calls

  // Rotación automática de banners cada 8 segundos
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToNext = () => {
    if (banners.length > 1) {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }
  };

  const goToPrevious = () => {
    if (banners.length > 1) {
      setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  const goToBanner = (index: number) => {
    if (index >= 0 && index < banners.length) {
      setCurrentBannerIndex(index);
    }
  };

  const currentBanner = banners[currentBannerIndex];

  return {
    banners,
    currentBanner,
    currentBannerIndex,
    isLoading,
    goToNext,
    goToPrevious,
    goToBanner,
    totalBanners: banners.length
  };
};
