import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InteractionResponse, UpdateInteractionRequest } from '@/utils/interactionsApiClient';

interface EditInteractionDialogProps {
  interaction: InteractionResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (interactionId: string, data: UpdateInteractionRequest) => Promise<boolean>;
}

const INTERACTION_TYPES = [
  { value: 'note', label: 'Nota' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'meeting', label: 'Reunión' },
  { value: 'email', label: 'Email' },
  { value: 'call', label: 'Llamada' },
];

const OUTCOME_OPTIONS = [
  { value: 'positive', label: 'Positivo' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'negative', label: 'Negativo' },
];

export const EditInteractionDialog: React.FC<EditInteractionDialogProps> = ({
  interaction,
  open,
  onOpenChange,
  onSave,
}) => {
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');
  const [stage, setStage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (interaction) {
      setType(interaction.Type || '');
      setDescription(interaction.Description || '');
      setOutcome(interaction.Outcome || '');
      setStage(interaction.Stage || '');
    }
  }, [interaction]);

  const handleSave = async () => {
    if (!interaction) return;

    // Validar campos requeridos
    if (!type || !description) {
      return;
    }

    setSaving(true);
    const updateData: UpdateInteractionRequest = {
      Type: type,
      Description: description,
      Outcome: outcome || undefined,
      Stage: stage || undefined,
    };

    const success = await onSave(interaction.Id, updateData);
    setSaving(false);

    if (success) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Interacción</DialogTitle>
          <DialogDescription>
            Modifica los campos de la interacción. Solo puedes editar tus propias interacciones.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Contacto *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {INTERACTION_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la interacción..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Resultado</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar resultado" />
              </SelectTrigger>
              <SelectContent>
                {OUTCOME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stage">Etapa</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nuevo">Nuevo</SelectItem>
                <SelectItem value="Contactado">Contactado</SelectItem>
                <SelectItem value="Calificado">Calificado</SelectItem>
                <SelectItem value="Propuesta">Propuesta</SelectItem>
                <SelectItem value="Negociación">Negociación</SelectItem>
                <SelectItem value="Cerrado">Cerrado</SelectItem>
                <SelectItem value="Descartado">Descartado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!type || !description || saving}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
