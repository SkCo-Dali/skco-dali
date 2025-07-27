
import React from 'react';
import { Lead } from '@/types/crm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MessageSquare, ExternalLink, ChevronDown } from 'lucide-react';

interface WhatsAppActionsMenuProps {
  lead: Lead;
  onSendWithSami: (lead: Lead) => void;
  variant?: 'icon' | 'full';
}

export function WhatsAppActionsMenu({ lead, onSendWithSami, variant = 'icon' }: WhatsAppActionsMenuProps) {
  const handleWhatsAppWeb = () => {
    if (lead.phone) {
      const message = `Hola ${lead.name}, soy de Skandia y me gustaría conversar contigo sobre nuestros productos.`;
      const whatsappUrl = `https://wa.me/${lead.phone}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleSendWithSami = () => {
    onSendWithSami(lead);
  };

  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuItem onClick={handleSendWithSami} className="cursor-pointer">
            <MessageSquare className="h-4 w-4 mr-2 text-[#25D366]" />
            Enviar WhatsApp con Sami
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleWhatsAppWeb} className="cursor-pointer">
            <ExternalLink className="h-4 w-4 mr-2 text-[#25D366]" />
            Enviar por WhatsApp Web
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#25D366] text-white border-[#25D366] hover:bg-[#25D366]/90 hover:border-[#25D366]/90"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          WhatsApp
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuItem onClick={handleSendWithSami} className="cursor-pointer">
          <MessageSquare className="h-4 w-4 mr-2 text-[#25D366]" />
          Enviar WhatsApp con Sami
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppWeb} className="cursor-pointer">
          <ExternalLink className="h-4 w-4 mr-2 text-[#25D366]" />
          Enviar por WhatsApp Web
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
