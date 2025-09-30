import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Lead } from '@/types/crm';
import { WhatsAppPropioManager } from '@/components/whatsapp/WhatsAppPropioManager';
import { FaWhatsapp } from "react-icons/fa";
import { useIsMobile, useIsMedium } from '@/hooks/use-mobile';

interface WhatsAppPropioButtonProps {
  leads: Lead[];
  userEmail: string;
  disabled?: boolean;
}

export function WhatsAppPropioButton({ leads, userEmail, disabled = false }: WhatsAppPropioButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const isMedium = useIsMedium();
  
  const isSmallOrMedium = isMobile || isMedium;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={disabled || leads.length === 0}
        className={isSmallOrMedium ? "h-8 w-8 gap-2 px-3 py-2 h-auto" : "h-8 w-8 gap-2 px-3 py-2 h-auto"}
        size={isSmallOrMedium ? "icon" : "icon"}
        variant={isSmallOrMedium ? "default" : "default"}
      >
        <FaWhatsapp className="h-4 w-4" />
        {isSmallOrMedium && <span>WhatsApp</span>}
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