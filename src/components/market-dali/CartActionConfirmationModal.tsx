import React, { useState, useMemo, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Mail, MessageCircle, Plus, AlertTriangle, CheckCircle2, Upload } from 'lucide-react';
import { CartItem } from '@/types/marketDali';
import { z } from 'zod';

type ActionType = 'email' | 'whatsapp' | 'leads';

// Validation schemas
const emailSchema = z.string().email().max(255);
const phoneSchema = z.string().min(7).max(20).regex(/^[\d\s\-\+\(\)]+$/);

interface CartActionConfirmationModalProps {
  isOpen: boolean;
  actionType: ActionType | null;
  items: CartItem[];
  opportunityTitle: string | null;
  onConfirm: (selectedClientIds: string[]) => void;
  onCancel: () => void;
  onAddMore: () => void;
}

interface ClientValidation {
  id: string;
  name: string;
  contactValue: string;
  isValid: boolean;
}

export const CartActionConfirmationModal: React.FC<CartActionConfirmationModalProps> = ({
  isOpen,
  actionType,
  items,
  opportunityTitle,
  onConfirm,
  onCancel,
  onAddMore,
}) => {
  const isEmail = actionType === 'email';
  const isWhatsApp = actionType === 'whatsapp';
  const isLeads = actionType === 'leads';
  const Icon = isLeads ? Upload : isEmail ? Mail : MessageCircle;
  const actionLabel = isLeads ? 'cargue de leads' : isEmail ? 'correo' : 'WhatsApp';
  const actionLabelPlural = isLeads ? 'clientes' : isEmail ? 'correos' : 'mensajes de WhatsApp';

  // Validate clients and track selection
  const validatedClients = useMemo((): ClientValidation[] => {
    return items.map(item => {
      let contactValue = '';
      let isValid = true; // For leads, all clients are valid by default
      
      if (isEmail) {
        contactValue = item.client.email || '';
        isValid = emailSchema.safeParse(contactValue).success;
      } else if (isWhatsApp) {
        contactValue = item.client.phone || '';
        isValid = phoneSchema.safeParse(contactValue).success;
      } else if (isLeads) {
        // For leads, show document info as contact value
        contactValue = item.client.documentNumber ? `${item.client.documentType || 'Doc'}: ${item.client.documentNumber}` : '';
        isValid = true; // All clients are valid for lead loading
      }

      return {
        id: item.client.id,
        name: item.client.name,
        contactValue,
        isValid,
      };
    });
  }, [items, isEmail, isWhatsApp, isLeads]);

  const validClients = useMemo(() => validatedClients.filter(c => c.isValid), [validatedClients]);
  const invalidClients = useMemo(() => validatedClients.filter(c => !c.isValid), [validatedClients]);

  // Selection state - default to all valid clients selected
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => 
    new Set(validClients.map(c => c.id))
  );

  // Reset selection when modal opens with new items
  React.useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(validClients.map(c => c.id)));
    }
  }, [isOpen, validClients]);

  const handleToggleClient = useCallback((clientId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(validClients.map(c => c.id)));
  }, [validClients]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleConfirm = useCallback(() => {
    onConfirm(Array.from(selectedIds));
  }, [onConfirm, selectedIds]);

  const selectedCount = selectedIds.size;
  const canConfirm = selectedCount > 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-full ${isLeads ? 'bg-primary/10' : isEmail ? 'bg-blue-100' : 'bg-green-100'}`}>
              <Icon className={`h-5 w-5 ${isLeads ? 'text-primary' : isEmail ? 'text-blue-600' : 'text-green-600'}`} />
            </div>
            <AlertDialogTitle className="text-lg">
              {isLeads ? 'Confirmar cargue de clientes' : `Confirmar envío de ${actionLabel}`}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              {opportunityTitle && (
                <p className="text-muted-foreground">
                  Oportunidad: <span className="font-medium text-foreground">{opportunityTitle}</span>
                </p>
              )}
              
              {/* Validation summary */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  {validClients.length} válidos
                </Badge>
                {invalidClients.length > 0 && !isLeads && (
                  <Badge variant="outline" className="text-xs flex items-center gap-1 border-destructive/50 text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {invalidClients.length} sin {isEmail ? 'email' : 'teléfono'} válido
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {selectedCount} seleccionados
                </Badge>
              </div>

              {/* Selection controls */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-primary hover:underline"
                >
                  Seleccionar todos
                </button>
                <span className="text-muted-foreground">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-xs text-primary hover:underline"
                >
                  Deseleccionar todos
                </button>
              </div>

              <ScrollArea className="h-[200px] rounded-lg border border-border">
                <div className="p-2 space-y-1">
                  {/* Valid clients */}
                  {validClients.map((client) => (
                    <label
                      key={client.id}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted/70 transition-colors"
                    >
                      <Checkbox
                        checked={selectedIds.has(client.id)}
                        onCheckedChange={() => handleToggleClient(client.id)}
                      />
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {client.contactValue}
                        </p>
                      </div>
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                    </label>
                  ))}
                  
                  {/* Invalid clients */}
                  {invalidClients.length > 0 && (
                    <>
                      <div className="pt-2 pb-1 px-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          No disponibles ({invalidClients.length})
                        </p>
                      </div>
                      {invalidClients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center gap-2 p-2 bg-destructive/5 rounded-md opacity-60"
                        >
                          <div className="w-4" /> {/* Spacer for alignment */}
                          <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-3 w-3 text-destructive" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {client.name}
                            </p>
                            <p className="text-xs text-destructive truncate">
                              {client.contactValue || `Sin ${isEmail ? 'email' : 'teléfono'}`}
                            </p>
                          </div>
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>

              <p className="text-muted-foreground">
                {canConfirm 
                  ? isLeads 
                    ? `Se cargarán ${selectedCount} ${actionLabelPlural} en el módulo de leads.`
                    : `Se enviarán ${selectedCount} ${actionLabelPlural}.`
                  : `Selecciona al menos un cliente para continuar.`
                }
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={onCancel} className="w-full sm:w-auto">
            Cancelar
          </AlertDialogCancel>
          <button
            type="button"
            onClick={onAddMore}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Agregar más
          </button>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`w-full sm:w-auto ${isLeads ? '' : isEmail ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#25D366] hover:bg-[#25D366]/90'} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Continuar ({selectedCount})
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
