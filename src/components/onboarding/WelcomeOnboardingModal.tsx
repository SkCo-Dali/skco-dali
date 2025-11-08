import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { StepPreferredName } from './StepPreferredName';
import { StepContactChannels } from './StepContactChannels';
import { StepEmailSignature } from './StepEmailSignature';
import { StepPrimaryAction } from './StepPrimaryAction';
import { StepSingleWish } from './StepSingleWish';
import { OnboardingData } from '@/types/onboarding';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { useInAppMessaging } from '@/hooks/useInAppMessaging';
import { toast } from 'sonner';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  userRole: string;
  onComplete: (data: OnboardingData) => Promise<boolean>;
}

export function WelcomeOnboardingModal({ isOpen, userRole, onComplete }: WelcomeOnboardingModalProps) {
  const navigate = useNavigate();
  const { registerEvent } = useInAppMessaging();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [data, setData] = useState<Partial<OnboardingData>>({
    whatsapp: {
      countryCode: '+57',
      phone: '',
    },
  });

  const totalSteps = 5;
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
        
        // Mostrar mensaje de éxito y redirigir
        setTimeout(() => {
          if (finalData.primaryAction?.route) {
            navigate(finalData.primaryAction.route);
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
          <StepEmailSignature
            initialValue={data.emailSignature || ''}
            onNext={(signature) => {
              setData({ ...data, emailSignature: signature });
              setCurrentStep(4);
            }}
            onBack={() => setCurrentStep(2)}
          />
        );

      case 4:
        return (
          <StepPrimaryAction
            userRole={userRole}
            initialValue={data.primaryAction}
            onNext={(action) => {
              setData({ ...data, primaryAction: action });
              setCurrentStep(5);
            }}
            onBack={() => setCurrentStep(3)}
          />
        );

      case 5:
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
            onBack={() => setCurrentStep(4)}
          />
        );

      default:
        return null;
    }
  };

  // Completion screen
  if (isCompleted) {
    return (
      <Dialog open={isOpen} modal>
        <DialogContent 
          className="max-w-md"
          aria-describedby="completion-message"
        >
          <div className="text-center space-y-6 py-8 animate-scale-in">
            <div className="flex justify-center">
              <div className="p-6 rounded-full bg-primary/10">
                <Sparkles className="h-12 w-12 text-primary animate-pulse" />
              </div>
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
