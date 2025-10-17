
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Lead } from "@/types/crm";
import { useAssignableUsers } from "@/contexts/AssignableUsersContext";
import { useLeadAssignments } from "@/hooks/useLeadAssignments";
import { changeLeadStage } from "@/utils/leadsApiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AssignableUser } from "@/utils/leadAssignmentApiClient";
import { Search } from "lucide-react";
import { LeadAssigneeSelect } from "@/components/LeadAssigneeSelect";

interface EditableLeadCellProps {
  lead: Lead;
  field: 'stage' | 'assignedTo' | 'assignedToName' | 'email' | 'phone' | 'company' | 'documentNumber' | 'priority';
  onUpdate: () => void;
}

const stageOptions = [
  'Nuevo',
  'Asignado', 
  'Localizado: No interesado',
  'Localizado: Prospecto de venta FP',
  'Localizado: Prospecto de venta AD',
  'Localizado: Prospecto de venta - Pendiente',
  'Localizado: Volver a llamar',
  'Localizado: No vuelve a contestar',
  'No localizado: No contesta',
  'No localizado: Número equivocado',
  'Contrato Creado',
  'Registro de Venta (fondeado)',
  'Repetido'
];

const priorityOptions = [
  'low',
  'medium', 
  'high',
  'urgent'
];

const priorityLabels = {
  'low': 'Baja',
  'medium': 'Media',
  'high': 'Alta',
  'urgent': 'Urgente'
};

export function EditableLeadCell({ lead, field, onUpdate }: EditableLeadCellProps) {
  const { users: assignableUsers, loading: loadingAssignableUsers } = useAssignableUsers();
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleReassignLead } = useLeadAssignments();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleValueChange = async (newValue: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      if (field === 'stage') {
        await changeLeadStage(lead.id, newValue);
        
        // Actualizar el lead localmente para mostrar cambio inmediato
        lead.stage = newValue;
        
        toast({
          title: "Éxito",
          description: `Etapa del lead actualizada a '${newValue}'`,
        });
        
      } else if (field === 'assignedTo' || field === 'assignedToName') {
        const assignedToValue = newValue === 'unassigned' ? '' : newValue;
        
        if (lead.assignedTo && assignedToValue && lead.assignedTo !== assignedToValue) {
          const success = await handleReassignLead(
            lead.id, 
            assignedToValue,
            "Reasignación desde tabla",
            "Reasignado mediante dropdown de tabla",
            lead.stage,
            lead.assignedTo // Usuario que actualmente tiene el lead
          );
          
          if (success) {
            const assignedUser = assignableUsers.find(u => u.Id === assignedToValue);
            const assignedName = assignedUser?.Name || 'Usuario desconocido';
            
            // Actualizar el lead localmente para mostrar cambio inmediato
            lead.assignedTo = assignedToValue;
            lead.assignedToName = assignedName;
            
            toast({
              title: "Éxito",
              description: `Lead reasignado exitosamente a ${assignedName}`,
            });

            onUpdate();
          }
        } else {
          const success = await handleReassignLead(
            lead.id, 
            assignedToValue,
            "Asignación inicial desde tabla",
            "Asignado mediante dropdown de tabla",
            lead.stage,
            lead.assignedTo || undefined // Usuario que actualmente tiene el lead (puede ser vacío en asignación inicial)
          );
          
          if (success) {
            const assignedUser = assignableUsers.find(u => u.Id === assignedToValue);
            const assignedName = assignedUser?.Name || 'Usuario desconocido';
            
            // Actualizar el lead localmente para mostrar cambio inmediato
            lead.assignedTo = assignedToValue;
            lead.assignedToName = assignedName;
            
            toast({
              title: "Éxito",
              description: `Lead asignado exitosamente a ${assignedName}`,
            });

            onUpdate();
          }
        }
      } else if (field === 'priority') {
        toast({
          title: "Información",
          description: `Funcionalidad de prioridad aún en desarrollo`,
          variant: "default",
        });
      }
      
      if (field === 'stage') {
        onUpdate();
      }
      
    } catch (error) {
      console.error(`❌ Error updating lead ${field}:`, error);
      toast({
        title: "Error",
        description: `Error al actualizar ${field === 'stage' ? 'etapa' : field === 'priority' ? 'prioridad' : 'asignación'}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTextFieldUpdate = async (newValue: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      toast({
        title: "Información",
        description: `Funcionalidad de edición de ${field} aún en desarrollo`,
        variant: "default",
      });
      
    } catch (error) {
      console.error(`❌ Error updating lead ${field}:`, error);
      toast({
        title: "Error",
        description: `Error al actualizar ${field}: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditStart = (currentValue: string) => {
    setEditValue(currentValue);
    setIsEditing(true);
  };

  const handleEditSave = () => {
    handleTextFieldUpdate(editValue);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditValue('');
  };

  if (field === 'stage') {
    return (
      <Select
        value={lead.stage}
        onValueChange={handleValueChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-full border-none shadow-none p-2 h-8">
          <span className="text-xs text-center">
            {lead.stage}
          </span>
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          {stageOptions.map((stage) => (
            <SelectItem key={stage} value={stage}>
              {stage}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field === 'priority') {
    return (
      <Select
        value={lead.priority}
        onValueChange={handleValueChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-full border-none shadow-none p-2 h-8">
          <span className="text-xs text-center">
            {priorityLabels[lead.priority as keyof typeof priorityLabels] || lead.priority}
          </span>
        </SelectTrigger>
        <SelectContent className="bg-white z-50">
          {priorityOptions.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {priorityLabels[priority as keyof typeof priorityLabels]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field === 'assignedTo' || field === 'assignedToName') {
    // Use assignedToName directly from API response - no need for user lookup
    const displayName = lead.assignedToName || 'Sin asignar';

    return (
      <LeadAssigneeSelect
        value={lead.assignedTo || ""}
        displayName={displayName}
        users={assignableUsers}
        loading={loadingAssignableUsers}
        onSelect={handleValueChange}
      />
    );
  }

  // Para campos editables de texto (email, phone, company, documentNumber)
  const getCurrentValue = () => {
    switch (field) {
      case 'email':
        return lead.email || '';
      case 'phone':
        return lead.phone || '';
      case 'company':
        return lead.company || '';
      case 'documentNumber':
        return lead.documentNumber?.toString() || '';
      default:
        return '';
    }
  };

  const getPlaceholder = () => {
    switch (field) {
      case 'email':
        return '';
      case 'phone':
        return '';
      case 'company':
        return 'Nombre empresa';
      case 'documentNumber':
        return '12345678';
      default:
        return '';
    }
  };

  const displayValue = getCurrentValue();

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8 text-xs"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleEditSave();
            } else if (e.key === 'Escape') {
              handleEditCancel();
            }
          }}
          autoFocus
        />
        <div className="flex space-x-1">
          <button
            onClick={handleEditSave}
            className="text-green-600 hover:text-green-800 text-xs"
            disabled={isUpdating}
          >
            ✓
          </button>
          <button
            onClick={handleEditCancel}
            className="text-red-600 hover:text-red-800 text-xs"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer bg-white p-1 rounded text-xs truncate min-h-[24px] flex items-center text-center justify-center"
      onClick={() => handleEditStart(displayValue)}
      title="Click para editar"
    >
      {displayValue || <span className="text-gray-400">{getPlaceholder()}</span>}
    </div>
  );
}
