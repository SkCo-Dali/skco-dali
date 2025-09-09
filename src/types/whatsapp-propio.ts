export interface MensajeSalida {
  id: string;
  to_e164: string;
  texto_resuelto: string;
  adjuntos?: FileRef[];
}

export interface FileRef {
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface LoteSalida {
  loteId: string;
  mensajes: MensajeSalida[];
  throttle: { 
    porMinuto: number; 
    jitterSeg: [number, number] | null 
  };
  dryRun: boolean;
  meta: { 
    createdBy: string; 
    fuente: "WA_PROPIO" 
  };
}

export type EstadoExtension = 'desconocido' | 'no_detectada' | 'detectada' | 'sesion_ok' | 'sesion_fallida';

export interface EventoExtension {
  kind: 'pong' | 'event' | 'done';
  loteId?: string;
  messageId?: string;
  status?: 'sent' | 'failed';
  error?: string;
  ticks?: '✓' | '✓✓' | '✓✓ azul';
  total?: number;
  sent?: number;
  failed?: number;
  durationMs?: number;
}

export interface PhoneValidationResult {
  ok: boolean;
  e164?: string;
  motivo?: 'SIN_TELEFONO' | 'NO_MOVIL_CO' | 'FORMATO_INVALIDO';
}

export interface LeadValidationError {
  leadId: string;
  leadName: string;
  phoneOriginal: string;
  motivo: string;
}

export interface SendProgress {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  eta?: string;
  isActive: boolean;
  isPaused: boolean;
}

export interface SendEvent {
  id: string;
  timestamp: string;
  leadName: string;
  phoneNumber: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  ticks?: string;
}