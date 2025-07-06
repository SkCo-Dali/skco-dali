
import { useState, useEffect } from 'react';

interface DeviceInfo {
  userAgent?: string;
  platform?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  browserName?: string;
  browserVersion?: string;
  operatingSystem?: string;
  screenResolution?: string;
  language?: string;
  timezone?: string;
}

interface LocationInfo {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({});
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    // Obtener información del dispositivo
    const getDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      
      // Detectar tipo de dispositivo
      const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android.*Tablet/i.test(userAgent);
      
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
      if (isMobile && !isTablet) {
        deviceType = 'mobile';
      } else if (isTablet) {
        deviceType = 'tablet';
      }

      // Detectar navegador - MEJORADO para detectar Edge correctamente
      let browserName = 'Unknown';
      let browserVersion = 'Unknown';
      
      // Primero verificar Edge (debe ir antes que Chrome porque Edge incluye "Chrome" en su UA)
      if (userAgent.indexOf('Edg/') > -1 || userAgent.indexOf('Edge/') > -1) {
        browserName = 'Edge';
        const edgeMatch = userAgent.match(/(?:Edg|Edge)\/(\d+)/);
        browserVersion = edgeMatch ? edgeMatch[1] : 'Unknown';
      } else if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg/') === -1) {
        browserName = 'Chrome';
        const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
        browserVersion = chromeMatch ? chromeMatch[1] : 'Unknown';
      } else if (userAgent.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
        browserVersion = firefoxMatch ? firefoxMatch[1] : 'Unknown';
      } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1 && userAgent.indexOf('Edg/') === -1) {
        browserName = 'Safari';
        const safariMatch = userAgent.match(/Version\/(\d+)/);
        browserVersion = safariMatch ? safariMatch[1] : 'Unknown';
      }

      // Detectar sistema operativo
      let operatingSystem = 'Unknown';
      if (userAgent.indexOf('Windows') > -1) operatingSystem = 'Windows';
      else if (userAgent.indexOf('Mac') > -1) operatingSystem = 'macOS';
      else if (userAgent.indexOf('Linux') > -1) operatingSystem = 'Linux';
      else if (userAgent.indexOf('Android') > -1) operatingSystem = 'Android';
      else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) operatingSystem = 'iOS';

      const info: DeviceInfo = {
        userAgent,
        platform,
        deviceType,
        browserName,
        browserVersion,
        operatingSystem,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      console.log('Device info collected:', info);
      console.log('User Agent for debugging:', userAgent);
      console.log('Detected browser:', browserName, 'version:', browserVersion);
      setDeviceInfo(info);
    };

    getDeviceInfo();
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      return false;
    }

    try {
      setIsLoadingLocation(true);
      console.log('Requesting location permission...');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });

      const location: LocationInfo = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      console.log('Location info collected:', location);
      setLocationInfo(location);
      return true;
    } catch (error) {
      console.warn('Failed to get location:', error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.warn('Location permission denied by user');
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn('Location information is unavailable');
            break;
          case error.TIMEOUT:
            console.warn('Location request timed out');
            break;
        }
      }
      return false;
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const getCompleteDeviceInfo = (ipAddress?: string) => {
    return {
      ...deviceInfo,
      ipAddress,
      location: locationInfo ? {
        latitude: locationInfo.latitude,
        longitude: locationInfo.longitude,
        accuracy: locationInfo.accuracy
      } : undefined
    };
  };

  return {
    deviceInfo,
    locationInfo,
    isLoadingLocation,
    requestLocationPermission,
    getCompleteDeviceInfo
  };
};
