import React from 'react';
import { useLeadFormWithPersistence } from '@/hooks/useLeadFormWithPersistence';
import { SessionRestorationModal } from '@/components/SessionRestorationModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, Shield } from 'lucide-react';

interface LeadFormWithAutoSaveProps {
  leadId?: string;
  initialData?: any;
  onSave?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

/**
 * Ejemplo de formulario de lead con auto-guardado integrado
 */
export const LeadFormWithAutoSave: React.FC<LeadFormWithAutoSaveProps> = ({
  leadId,
  initialData = {},
  onSave,
  onCancel
}) => {
  const {
    formData,
    updateFormData,
    showRestoreModal,
    handleRestore,
    handleDiscardRestore,
    handleSuccessfulSave,
    resetForm,
    manualSave,
    hasUnsavedChanges
  } = useLeadFormWithPersistence(leadId);

  // Inicializar con datos existentes si no hay datos restaurados
  React.useEffect(() => {
    if (initialData && Object.keys(formData).length === 0) {
      updateFormData(initialData);
    }
  }, [initialData, formData, updateFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSave) {
      try {
        await onSave(formData);
        handleSuccessfulSave(); // Limpia el backup después de guardar exitosamente
      } catch (error) {
        console.error('Error saving lead:', error);
        // El backup se mantiene en caso de error
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {leadId ? 'Editar Lead' : 'Crear Nuevo Lead'}
            </CardTitle>
            
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="gap-1">
                <Shield className="h-3 w-3" />
                Auto-guardado activo
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre || ''}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  placeholder="Nombre completo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono || ''}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  value={formData.empresa || ''}
                  onChange={(e) => handleInputChange('empresa', e.target.value)}
                  placeholder="Nombre de la empresa"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comentarios">Comentarios</Label>
              <Textarea
                id="comentarios"
                value={formData.comentarios || ''}
                onChange={(e) => handleInputChange('comentarios', e.target.value)}
                placeholder="Notas adicionales sobre el lead..."
                rows={4}
              />
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-muted-foreground">
                💾 Los datos se guardan automáticamente cada 30 segundos
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={manualSave}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Guardar ahora
                </Button>
                
                <Button type="submit">
                  Finalizar
                </Button>
                
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <SessionRestorationModal
        isOpen={showRestoreModal}
        onRestore={handleRestore}
        onDiscard={handleDiscardRestore}
        formName="formulario de lead"
        lastSaved={new Date()} // Aquí podrías usar la fecha real del backup
      />
    </>
  );
};