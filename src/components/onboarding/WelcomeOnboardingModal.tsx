import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { StepPreferredName } from './StepPreferredName';
import { StepContactChannels } from './StepContactChannels';
import { StepPrimaryAction } from './StepPrimaryAction';
import { StepSingleWish } from './StepSingleWish';
import { OnboardingData } from '@/types/onboarding';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { useInAppMessaging } from '@/hooks/useInAppMessaging';
import { toast } from 'sonner';
import Lottie from 'lottie-react';
import { onboardingApiClient } from '@/utils/onboardingApiClient';
import { userProfileApiClient } from '@/utils/userProfileApiClient';
import { useAuth } from '@/contexts/AuthContext';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  userRole: string;
  onComplete: (data: OnboardingData) => Promise<boolean>;
  onClose?: () => void;
}

export function WelcomeOnboardingModal({ isOpen, userRole, onComplete, onClose }: WelcomeOnboardingModalProps) {
  const navigate = useNavigate();
  const { registerEvent } = useInAppMessaging();
  const { accessToken, updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(null);
  const [data, setData] = useState<Partial<OnboardingData>>({
    whatsapp: {
      countryCode: '+57',
      phone: '',
    },
  });

  useEffect(() => {
    fetch('/animations/successful.json')
      .then(res => res.json())
      .then(data => setSuccessAnimation(data));
  }, []);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleComplete = async (finalData: OnboardingData) => {
    setIsSubmitting(true);
    
    try {
      const success = await onComplete(finalData);
      
      if (success) {
        // Registrar evento click
        await registerEvent({
          message_id: 'cmp_onboarding_welcome_v1',
          event: 'click',
          context: 'login',
          route: finalData.primaryAction?.route || '/dashboard',
        });

        setIsCompleted(true);
        
        // Cargar datos de perfil después de completar onboarding
        setTimeout(async () => {
          try {
            if (accessToken) {
              // Cargar perfil completo recién capturado en el onboarding
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
              navigate(startPage.route);
            } else {
              // Fallback a la ruta de primaryAction si no hay token
              if (finalData.primaryAction?.route) {
                navigate(finalData.primaryAction.route);
              }
            }
          } catch (error) {
            console.error('Error fetching start page:', error);
            // Fallback a la ruta de primaryAction en caso de error
            if (finalData.primaryAction?.route) {
              navigate(finalData.primaryAction.route);
            }
          }
        }, 1500);
      } else {
        toast.error('Error al guardar tus datos. Por favor intenta de nuevo.');
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      toast.error(error.message || 'Error al guardar. Por favor intenta de nuevo.');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepPreferredName
            initialValue={data.preferredName || ''}
            onNext={(name) => {
              setData({ ...data, preferredName: name });
              setCurrentStep(2);
            }}
          />
        );

      case 2:
        return (
          <StepContactChannels
            initialValue={{
              whatsapp: data.whatsapp || { countryCode: 'CO', phone: '' },
              socialMedia: data.socialMedia,
            }}
            onNext={(contactData) => {
              setData({ ...data, ...contactData });
              setCurrentStep(3);
            }}
            onBack={() => setCurrentStep(1)}
          />
        );

      case 3:
        return (
          <StepPrimaryAction
            userRole={userRole}
            initialValue={data.primaryAction}
            onNext={(action) => {
              setData({ ...data, primaryAction: action });
              setCurrentStep(4);
            }}
            onBack={() => setCurrentStep(2)}
          />
        );

      case 4:
        return (
          <StepSingleWish
            initialValue={data.singleWish || ''}
            preferredName={data.preferredName || ''}
            isSubmitting={isSubmitting}
            onComplete={(wish) => {
              const finalData: OnboardingData = {
                preferredName: data.preferredName!,
                whatsapp: data.whatsapp!,
                socialMedia: data.socialMedia,
                emailSignature: data.emailSignature,
                primaryAction: data.primaryAction,
                singleWish: wish,
              };
              handleComplete(finalData);
            }}
            onBack={() => setCurrentStep(3)}
          />
        );

      default:
        return null;
    }
  };

  // Completion screen
  if (isCompleted) {
    const handleClose = () => {
      // Navegar inmediatamente al cerrar
      if (data.primaryAction?.route) {
        navigate(data.primaryAction.route);
      } else {
        navigate('/dashboard');
      }
    };

    return (
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose?.(); handleClose(); } }}>
        <DialogContent 
          className="max-w-md"
          aria-describedby="completion-message"
        >
          <div className="text-center space-y-6 py-8 animate-scale-in">
            <div className="flex justify-center">
              {successAnimation ? (
                <div className="w-64 h-64">
                  <Lottie animationData={successAnimation} loop={true} />
                </div>
              ) : (
                <div className="p-6 rounded-full bg-primary/10">
                  <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                ¡Listo, {data.preferredName}!
              </h2>
              <p id="completion-message" className="text-xl text-muted-foreground">
                Gracias por ayudarme a conocerte 💛
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} modal>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby="onboarding-description"
      >
        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Paso {currentStep} de {totalSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div id="onboarding-description">
            {renderStep()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
