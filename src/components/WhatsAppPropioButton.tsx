import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Lead } from '@/types/crm';
import { WhatsAppPropioManager } from '@/components/whatsapp/WhatsAppPropioManager';
import { FaWhatsapp } from "react-icons/fa";

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
        className=" h-8 w-8 bg-primary gap-1"
      >
        <FaWhatsapp className="h-4 w-4" />
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