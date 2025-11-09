import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useInAppMessaging } from '@/hooks/useInAppMessaging';
import { WelcomeOnboardingModal } from './WelcomeOnboardingModal';

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const location = useLocation();
  const { user, isAuthenticated, accessToken } = useAuth();
  const { isCompleted, completeOnboarding } = useOnboarding();
  const { checkOnboardingRequired, registerEvent } = useInAppMessaging();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      // Solo verificar si está autenticado, NO revisar isCompleted aquí
      // El API decidirá si debe mostrar el onboarding
      if (!isAuthenticated || !user || !accessToken) {
        setIsChecking(false);
        return;
      }

      try {
        const required = await checkOnboardingRequired(location.pathname);
        
        if (required) {
          // Registrar evento view
          await registerEvent({
            message_id: 'cmp_onboarding_welcome_v1',
            event: 'view',
            context: 'login',
            route: location.pathname,
          });
          
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkOnboarding();
  }, [isAuthenticated, user, accessToken, isCompleted, location.pathname, checkOnboardingRequired, registerEvent]);

  if (isChecking) {
    return null; // O un loader si prefieres
  }

  return (
    <>
      {children}
      {showOnboarding && (
        <WelcomeOnboardingModal
          isOpen={showOnboarding}
          userRole={user?.role || 'agent'}
          onComplete={completeOnboarding}
        />
      )}
    </>
  );
}
