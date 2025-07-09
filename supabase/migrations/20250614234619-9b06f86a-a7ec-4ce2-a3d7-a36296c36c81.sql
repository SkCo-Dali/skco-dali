
-- Crear tabla para tipos de notificaciones predefinidos
CREATE TABLE public.notification_types (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  has_amount_threshold BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla para configuraciones de notificaciones por usuario
CREATE TABLE public.user_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type_id INTEGER REFERENCES public.notification_types(id),
  is_enabled BOOLEAN DEFAULT TRUE,
  minimum_amount DECIMAL(15,2) DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type_id)
);

-- Habilitar RLS
ALTER TABLE public.notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para notification_types (solo lectura para usuarios autenticados)
CREATE POLICY "Users can view notification types" 
  ON public.notification_types 
  FOR SELECT 
  TO authenticated
  USING (TRUE);

-- Políticas para user_notification_settings
CREATE POLICY "Users can view their own notification settings" 
  ON public.user_notification_settings 
  FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own notification settings" 
  ON public.user_notification_settings 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notification settings" 
  ON public.user_notification_settings 
  FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_user_notification_settings_updated_at 
  BEFORE UPDATE ON public.user_notification_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar los 14 tipos de notificaciones predefinidos
INSERT INTO public.notification_types (code, name, description, has_amount_threshold) VALUES
('client_withdrawal', 'Retiros de dinero del cliente', 'Notificación cuando el cliente realiza un retiro', TRUE),
('client_deposit', 'Depósitos del cliente', 'Notificación cuando el cliente realiza un depósito', TRUE),
('portfolio_update', 'Actualizaciones de portafolio', 'Cambios importantes en el portafolio del cliente', FALSE),
('market_alert', 'Alertas del mercado', 'Alertas sobre movimientos del mercado', FALSE),
('appointment_reminder', 'Recordatorios de citas', 'Recordatorios de citas programadas', FALSE),
('document_pending', 'Documentos pendientes', 'Documentos que requieren atención', FALSE),
('contract_expiry', 'Vencimiento de contratos', 'Contratos próximos a vencer', FALSE),
('compliance_alert', 'Alertas de cumplimiento', 'Alertas relacionadas con compliance', FALSE),
('performance_report', 'Reportes de rendimiento', 'Reportes periódicos de rendimiento', FALSE),
('client_birthday', 'Cumpleaños de clientes', 'Recordatorios de cumpleaños de clientes', FALSE),
('payment_due', 'Pagos pendientes', 'Notificaciones de pagos pendientes', TRUE),
('risk_assessment', 'Evaluación de riesgo', 'Alertas sobre evaluaciones de riesgo', FALSE),
('new_opportunity', 'Nuevas oportunidades', 'Oportunidades de inversión para clientes', TRUE),
('system_maintenance', 'Mantenimiento del sistema', 'Notificaciones sobre mantenimiento programado', FALSE);
