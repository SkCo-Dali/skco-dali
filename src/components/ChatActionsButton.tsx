
import React, { useState } from 'react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Pencil, Search, FileText, EllipsisVertical, Ellipsis, RectangleEllipsis} from 'lucide-react';

interface ChatActionsButtonProps {
  onNewConversation: () => void;
  onSearchConversations: () => void;
  onViewTemplates: () => void;
}

export const ChatActionsButton: React.FC<ChatActionsButtonProps> = ({
  onNewConversation,
  onSearchConversations,
  onViewTemplates
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
  variant="ghost" // Para que no tenga borde ni fondo, solo el ícono
  size="icon"
  className="text-primary hover:bg-transparent"
>
  <img 
                      src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtZWxsaXBzaXMtaWNvbiBsdWNpZGUtZWxsaXBzaXMiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEiLz48Y2lyY2xlIGN4PSIxOSIgY3k9IjEyIiByPSIxIi8+PGNpcmNsZSBjeD0iNSIgY3k9IjEyIiByPSIxIi8+PC9zdmc+"
                      alt="Menu"
                      className="h-8 w-8"
                    />
</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg z-50">
        <DropdownMenuItem 
          onClick={onNewConversation}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Nueva Conversación
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onSearchConversations}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <Search className="h-4 w-4" />
          Buscar Conversación
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onViewTemplates}
          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer"
        >
          <FileText className="h-4 w-4" />
          Ver Plantillas
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
