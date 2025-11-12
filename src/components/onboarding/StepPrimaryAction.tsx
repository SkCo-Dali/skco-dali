import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { onboardingApiClient } from '@/utils/onboardingApiClient';
import { AvailableAction } from '@/types/onboardingApi';
import Lottie from 'lottie-react';

interface StepPrimaryActionProps {
  userRole: string;
  initialValue?: { label: string; route: string; code?: string };
  onNext: (action: { label: string; route: string; code: string }) => void;
  onBack: () => void;
}

export function StepPrimaryAction({
  userRole,
  initialValue,
  onNext,
  onBack,
}: StepPrimaryActionProps) {
  const { accessToken } = useAuth();
  const [options, setOptions] = useState<AvailableAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AvailableAction | null>(null);
  const [error, setError] = useState('');
  const [defaultAnimation, setDefaultAnimation] = useState(null);
  const [currentAnimation, setCurrentAnimation] = useState(null);

  // Mapeo de códigos de acción a archivos de animación
  const getAnimationPath = (code: string): string => {
    const normalizedCode = code.toLowerCase();
    console.log('🎬 Getting animation for code:', normalizedCode);
    
    if (normalizedCode.includes('lead')) return '/animations/leads.json';
    if (normalizedCode.includes('oportunidad')) return '/animations/market_oportunidades.json';
    if (normalizedCode.includes('informe') || normalizedCode.includes('report')) return '/animations/informes.json';
    
    return '/animations/choose_plan.json';
  };

  // Cargar la animación por defecto
  useEffect(() => {
    fetch('/animations/choose_plan.json')
      .then(res => res.json())
      .then(data => {
        setDefaultAnimation(data);
        setCurrentAnimation(data);
      })
      .catch(err => console.error('Error loading default animation:', err));
  }, []);

  // Cargar animación según la opción seleccionada
  useEffect(() => {
    if (selected) {
      const path = getAnimationPath(selected.code);
      console.log(`🎬 Loading animation for selected option: ${selected.code} from ${path}`);
      
      fetch(path)
        .then(res => res.json())
        .then(data => setCurrentAnimation(data))
        .catch(err => {
          console.error('Error loading animation:', err);
          setCurrentAnimation(defaultAnimation);
        });
    } else {
      setCurrentAnimation(defaultAnimation);
    }
  }, [selected, defaultAnimation]);

  useEffect(() => {
    const fetchActions = async () => {
      if (!accessToken) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      try {
        const response = await onboardingApiClient.getAvailableActions(accessToken);
        console.log('🎯 Available actions received:', response.actions);
        setOptions(response.actions);

        // Si solo hay una opción, seleccionarla automáticamente
        if (response.actions.length === 1) {
          setSelected(response.actions[0]);
        } else if (initialValue) {
          const match = response.actions.find(a => a.route === initialValue.route);
          if (match) setSelected(match);
        }
      } catch (err) {
        console.error('Error fetching available actions:', err);
        setError('Error al cargar las opciones. Por favor intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [accessToken, initialValue]);

  const getIconComponent = (iconName: string) => {
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className="h-6 w-6" /> : <LucideIcons.HelpCircle className="h-6 w-6" />;
  };

  const handleNext = () => {
    if (!selected) {
      setError('Por favor selecciona una opción');
      return;
    }
    onNext({ 
      label: selected.label, 
      route: selected.route,
      code: selected.code,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">¿Qué quieres hacer primero?</h2>
          <p className="text-muted-foreground">Cargando opciones...</p>
        </div>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {currentAnimation && (
        <div className="flex justify-center transition-opacity duration-300">
          <div className="w-64 h-64">
            <Lottie animationData={currentAnimation} loop={true} />
          </div>
        </div>
      )}
      
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">¿Qué quieres hacer primero?</h2>
        <p className="text-muted-foreground">
          Elige la acción con la que quieres empezar
        </p>
      </div>

      {error && !options.length ? (
        <div className="text-center py-8 space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={onBack} variant="outline">
            Volver
          </Button>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option) => (
              <Card
                key={option.code}
                className={cn(
                  'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                  selected?.code === option.code && 'border-primary bg-primary/5 shadow-md'
                )}
                onClick={() => {
                  setSelected(option);
                  setError('');
                }}
              >
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      selected?.code === option.code ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    )}>
                      {getIconComponent(option.icon)}
                    </div>
                    <h3 className="font-semibold text-lg">{option.label}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center mt-4" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-3 mt-6">
            <Button onClick={onBack} variant="outline" className="flex-1">
              Atrás
            </Button>
            <Button onClick={handleNext} className="flex-1" disabled={!selected}>
              Continuar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
