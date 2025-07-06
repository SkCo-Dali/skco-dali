
import { Lead } from '@/types/crm';
import { NotificationType, NotificationPriority } from '@/types/notifications';

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
}

export function createLeadAssignedNotification(lead: Lead, assignedUserName: string): NotificationTemplate {
  return {
    type: 'lead_assigned',
    title: 'Nuevo lead asignado',
    message: `Se te ha asignado un nuevo lead: ${lead.name} (${lead.company || 'Sin empresa'})`,
    priority: 'high'
  };
}

export function createLeadStatusChangedNotification(lead: Lead, oldStatus: string, newStatus: string): NotificationTemplate {
  const statusLabels: Record<string, string> = {
    'new': 'Nuevo',
    'contacted': 'Contactado',
    'qualified': 'Calificado',
    'quoted': 'Cotizado',
    'closed-won': 'Ganado',
    'closed-lost': 'Perdido'
  };

  return {
    type: 'lead_status_changed',
    title: 'Cambio de estado del lead',
    message: `${lead.name} cambió de "${statusLabels[oldStatus]}" a "${statusLabels[newStatus]}"`,
    priority: newStatus === 'closed-won' ? 'high' : 'medium'
  };
}

export function createFollowUpReminderNotification(lead: Lead, daysSinceLastContact: number): NotificationTemplate {
  return {
    type: 'follow_up_reminder',
    title: 'Recordatorio de seguimiento',
    message: `Es hora de hacer seguimiento con ${lead.name}. Último contacto hace ${daysSinceLastContact} días`,
    priority: daysSinceLastContact > 7 ? 'high' : 'medium'
  };
}

export function createMeetingScheduledNotification(lead: Lead, meetingDate: Date): NotificationTemplate {
  const dateStr = meetingDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    type: 'meeting_scheduled',
    title: 'Reunión programada',
    message: `Reunión con ${lead.name} programada para ${dateStr}`,
    priority: 'medium'
  };
}

export function createLeadInactiveNotification(lead: Lead, daysInactive: number): NotificationTemplate {
  return {
    type: 'lead_inactive',
    title: 'Lead inactivo',
    message: `${lead.name} no ha tenido actividad en ${daysInactive} días. Considera hacer seguimiento`,
    priority: daysInactive > 30 ? 'urgent' : 'high'
  };
}

export function createTaskPendingNotification(lead: Lead, taskDescription: string): NotificationTemplate {
  return {
    type: 'task_pending',
    title: 'Tarea pendiente',
    message: `Tienes una tarea pendiente para ${lead.name}: ${taskDescription}`,
    priority: 'medium'
  };
}

export function createLeadClosedNotification(lead: Lead, isWon: boolean): NotificationTemplate {
  return {
    type: 'lead_closed',
    title: isWon ? 'Lead ganado' : 'Lead perdido',
    message: `${lead.name} ha sido marcado como ${isWon ? 'ganado' : 'perdido'}. Valor: $${lead.value.toLocaleString()}`,
    priority: isWon ? 'high' : 'low'
  };
}

export function createEmailUpdateNotification(lead: Lead, emailType: string): NotificationTemplate {
  return {
    type: 'email_update',
    title: 'Actualización por email',
    message: `Nuevo ${emailType} recibido de ${lead.name}`,
    priority: 'medium'
  };
}

export function createDataErrorNotification(errorType: string, description: string): NotificationTemplate {
  return {
    type: 'data_error',
    title: 'Error en datos',
    message: `${errorType}: ${description}`,
    priority: 'urgent'
  };
}
