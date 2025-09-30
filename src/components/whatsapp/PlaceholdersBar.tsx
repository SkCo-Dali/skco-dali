import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building, 
  Mail, 
  Phone,
  Plus
} from 'lucide-react';

interface PlaceholdersBarProps {
  onInsertPlaceholder: (placeholder: string) => void;
}

const placeholders = [
  { key: 'name', label: 'Nombre', icon: User, description: 'Nombre del lead' },
  { key: 'company', label: 'Empresa', icon: Building, description: 'Empresa del lead' },
  { key: 'email', label: 'Email', icon: Mail, description: 'Correo electrónico' },
  { key: 'phone', label: 'Teléfono', icon: Phone, description: 'Número de teléfono' }
];

export function PlaceholdersBar({ onInsertPlaceholder }: PlaceholdersBarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Plus className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Campos dinámicos disponibles:
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {placeholders.map((placeholder) => {
          const Icon = placeholder.icon;
          return (
            <Button
              key={placeholder.key}
              onClick={() => onInsertPlaceholder(placeholder.key)}
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              title={placeholder.description}
            >
              <Icon className="h-3 w-3 mr-1" />
              {placeholder.label}
            </Button>
          );
        })}
      </div>
      
      <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
        <strong>Ejemplo:</strong> "Hola {"{name}"}, me complace contactarte desde {"{company}"} 
        para hablar sobre nuestros servicios."
      </div>
    </div>
  );
}