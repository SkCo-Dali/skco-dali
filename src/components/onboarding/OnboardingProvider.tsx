import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useInAppMessaging } from '@/hooks/useInAppMessaging';
import { WelcomeOnboardingModal } from './WelcomeOnboardingModal';
import { onboardingApiClient } from '@/utils/onboardingApiClient';
import { userProfileApiClient } from '@/utils/userProfileApiClient';

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, accessToken, updateUserProfile } = useAuth();
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
        } else {
          // Si no se requiere onboarding, cargar datos de perfil completo y redirigir
          if (location.pathname === '/login' || location.pathname === '/auth') {
            try {
              // Cargar perfil completo (el usuario ya completó el onboarding antes)
              try {
                const profileData = await userProfileApiClient.getProfile(accessToken);
                
                // Find WhatsApp contact channel
                const whatsappChannel = profileData.contactChannels.find(
                  channel => channel.channelType === 'WhatsApp'
                );

                updateUserProfile({
                  preferredName: profileData.basic.preferredName,
                  birthDate: profileData.basic.birthDate,
                  gender: profileData.basic.gender,
                  maritalStatus: profileData.basic.maritalStatus,
                  childrenCount: profileData.basic.childrenCount,
                  whatsappCountryCode: whatsappChannel?.countryCode || null,
                  whatsappPhone: whatsappChannel?.channelValue || null,
                  emailSignatureHtml: profileData.appPreferences.emailSignatureHtml,
                  primaryActionCode: profileData.appPreferences.primaryActionCode,
                  primaryActionRoute: profileData.appPreferences.primaryActionRoute,
                });
              } catch (error) {
                console.error('Error fetching profile:', error);
              }

              // Obtener página de inicio y redirigir
              const startPage = await onboardingApiClient.getStartPage(accessToken);
              navigate(startPage.route, { replace: true });
            } catch (error) {
              console.error('Error fetching start page:', error);
              // En caso de error, no hacer nada para evitar loops infinitos
            }
          }
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
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </>
  );
}
