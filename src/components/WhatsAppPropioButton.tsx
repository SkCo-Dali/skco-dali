import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Lead } from '@/types/crm';
import { WhatsAppPropioManager } from '@/components/whatsapp/WhatsAppPropioManager';

interface WhatsAppPropioButtonProps {
  leads: Lead[];
  userEmail: string;
  disabled?: boolean;
}

export function WhatsAppPropioButton({ leads, userEmail, disabled = false }: WhatsAppPropioButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={disabled || leads.length === 0}
        className="bg-[#25D366] hover:bg-[#25D366]/90"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Enviar WhatsApp ({leads.length})
      </Button>

      <WhatsAppPropioManager
        leads={leads}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userEmail={userEmail}
      />
    </>
  );
}