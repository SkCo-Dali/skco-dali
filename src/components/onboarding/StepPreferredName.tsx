import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface StepPreferredNameProps {
  initialValue: string;
  onNext: (name: string) => void;
}

export function StepPreferredName({ initialValue, onNext }: StepPreferredNameProps) {
  const [name, setName] = useState(initialValue);
  const [error, setError] = useState('');

  const handleNext = () => {
    const trimmed = name.trim();
    
    if (!trimmed) {
      setError('Por favor ingresa tu nombre preferido');
      return;
    }
    
    if (trimmed.length < 2 || trimmed.length > 40) {
      setError('El nombre debe tener entre 2 y 40 caracteres');
      return;
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/.test(trimmed)) {
      setError('Solo se permiten letras, espacios y guiones');
      return;
    }

    onNext(trimmed);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Quiero dirigirme a ti como prefieras</h2>
        <p className="text-muted-foreground">
          Usaré este nombre en mensajes y recomendaciones
        </p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <Label htmlFor="preferredName">¿Cómo quieres que te llame?</Label>
          <Input
            id="preferredName"
            placeholder="Ej: Juan, María, etc."
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyPress={(e) => e.key === 'Enter' && handleNext()}
            className={error ? 'border-destructive' : ''}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <Button onClick={handleNext} className="w-full" size="lg">
          Continuar
        </Button>
      </div>
    </div>
  );
}
