import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  TrendingUp, 
  FileText,
  MessageSquare,
  Briefcase,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionOption {
  label: string;
  route: string;
  icon: React.ReactNode;
  description: string;
}

interface StepPrimaryActionProps {
  userRole: string;
  initialValue?: { label: string; route: string };
  onNext: (action: { label: string; route: string }) => void;
  onBack: () => void;
}

// Mock options based on role - in real implementation, this would come from API
const getOptionsForRole = (role: string): ActionOption[] => {
  const baseOptions: ActionOption[] = [
    {
      label: 'Ver Dashboard',
      route: '/dashboard',
      icon: <LayoutDashboard className="h-6 w-6" />,
      description: 'Métricas y resumen general',
    },
    {
      label: 'Gestionar Leads',
      route: '/leads',
      icon: <Users className="h-6 w-6" />,
      description: 'Administra tus prospectos',
    },
    {
      label: 'Oportunidades',
      route: '/opportunities',
      icon: <Target className="h-6 w-6" />,
      description: 'Revisa oportunidades activas',
    },
    {
      label: 'Chat con Dali',
      route: '/chat',
      icon: <MessageSquare className="h-6 w-6" />,
      description: 'Consulta con IA',
    },
    {
      label: 'Informes',
      route: '/informes',
      icon: <FileText className="h-6 w-6" />,
      description: 'Reportes y análisis',
    },
  ];

  // Add role-specific options
  if (role === 'admin' || role === 'manager') {
    baseOptions.push({
      label: 'Comisiones',
      route: '/comisiones',
      icon: <TrendingUp className="h-6 w-6" />,
      description: 'Gestión de comisiones',
    });
  }

  return baseOptions;
};

export function StepPrimaryAction({ userRole, initialValue, onNext, onBack }: StepPrimaryActionProps) {
  const options = getOptionsForRole(userRole);
  const [selected, setSelected] = useState<ActionOption | undefined>(
    initialValue ? options.find(o => o.route === initialValue.route) : undefined
  );
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!selected) {
      setError('Por favor selecciona una opción');
      return;
    }
    onNext({ label: selected.label, route: selected.route });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">¿Qué quieres hacer primero?</h2>
        <p className="text-muted-foreground">
          Selecciona tu página de inicio preferida
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((option) => (
            <Card
              key={option.route}
              className={cn(
                'cursor-pointer transition-all hover:border-primary hover:shadow-md',
                selected?.route === option.route && 'border-primary bg-primary/5 shadow-md'
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
                    selected?.route === option.route ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}>
                    {option.icon}
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
          <Button onClick={handleNext} className="flex-1">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
