import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/RichTextEditor';

interface StepEmailSignatureProps {
  initialValue: string;
  onNext: (signature: string) => void;
  onBack: () => void;
}

export function StepEmailSignature({ initialValue, onNext, onBack }: StepEmailSignatureProps) {
  const [signature, setSignature] = useState(initialValue);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Incluye tu firma para correos</h2>
        <p className="text-muted-foreground">
          Esta firma se usará automáticamente en tus envíos masivos de correo
        </p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="space-y-2">
          <Label>Firma de correo (opcional)</Label>
          <p className="text-sm text-muted-foreground">
            Puedes incluir tu nombre, cargo, teléfono, redes sociales, incluso tu logo
          </p>
          <div className="border rounded-lg overflow-hidden">
            <RichTextEditor
              value={signature}
              onChange={setSignature}
              placeholder="Ej: 
Juan Pérez
Asesor Comercial
Tel: +57 310 123 4567
www.miempresa.com"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="flex-1">
            Atrás
          </Button>
          <Button onClick={() => onNext(signature)} className="flex-1">
            Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}
