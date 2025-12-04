import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Lead } from "@/types/crm";
import { EmailTemplate } from "@/types/email";

interface EmailPreviewProps {
  leads: Lead[];
  template: EmailTemplate;
  replaceDynamicFields: (template: string, lead: Lead) => string;
  alternateEmail?: string;
  selectedLeadIds: Set<string>;
  onToggleLead: (leadId: string) => void;
}

export function EmailPreview({
  leads,
  template,
  replaceDynamicFields,
  alternateEmail,
  selectedLeadIds,
  onToggleLead,
}: EmailPreviewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrar leads basado en la búsqueda
  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.company?.toLowerCase().includes(query) ||
      lead.phone?.toLowerCase().includes(query) ||
      lead.position?.toLowerCase().includes(query)
    );
  });

  const selectedCount = Array.from(selectedLeadIds).filter((id) => leads.some((l) => l.id === id)).length;

  if (leads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previsualización</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay leads seleccionados para previsualizar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-primary pb-2 sm:pb-4">
      <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
        <CardTitle className="flex flex-col gap-2 text-base sm:text-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-lg">Previsualización de Emails</span>
            <Badge variant="secondary" className="text-xs">
              {selectedCount}/{leads.length}
            </Badge>
          </div>
        </CardTitle>
        <p className="text-xs text-muted-foreground">Activa o desactiva el envío para cada destinatario</p>

        {/* Barra de búsqueda */}
        <div className="relative mt-3 sm:mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar destinatario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-9 sm:h-10 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <ScrollArea className="h-[calc(100vh-320px)] sm:h-[600px] pr-1 sm:pr-4">
          <div className="space-y-3 sm:space-y-4 pb-2 sm:pb-4">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No se encontraron destinatarios
              </div>
            ) : (
              filteredLeads.map((lead, index) => {
                const processedSubject = replaceDynamicFields(template.subject, lead);
                const processedContent = replaceDynamicFields(template.htmlContent, lead);

                // Para envíos individuales, mostrar el email alternativo si está especificado
                const displayEmail = leads.length === 1 && alternateEmail?.trim() ? alternateEmail.trim() : lead.email;

                const isSelected = selectedLeadIds.has(lead.id);

                return (
                  <Card
                    key={lead.id}
                    className={`border-l-4 pb-2 sm:pb-4 transition-all ${
                      isSelected ? "border-l-primary" : "border-l-muted-foreground/30 opacity-60"
                    }`}
                  >
                    <CardHeader className="pb-1 sm:pb-2 p-2 sm:p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => onToggleLead(lead.id)}
                            aria-label={`Enviar correo a ${lead.name}`}
                            className="shrink-0 scale-90 sm:scale-100"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-xs sm:text-base truncate">{lead.name}</p>
                            <p className="text-[10px] sm:text-sm text-muted-foreground truncate">{displayEmail}</p>
                            {leads.length === 1 && alternateEmail?.trim() && alternateEmail !== lead.email && (
                              <p className="text-[10px] text-blue-600">Email alternativo</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2">#{index + 1}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 p-2 sm:p-4">
                      <div className="space-y-2 sm:space-y-3">
                        <div>
                          <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground">ASUNTO:</Label>
                          <p className="font-medium text-xs sm:text-base break-words line-clamp-2">{processedSubject}</p>
                        </div>

                        <div>
                          <Label className="text-[10px] sm:text-xs font-medium text-muted-foreground">CONTENIDO:</Label>
                          <div
                            className="border rounded p-2 bg-muted/30 text-[11px] sm:text-sm max-h-32 sm:max-h-48 overflow-y-auto [&_img]:max-w-full [&_table]:text-[10px] sm:[&_table]:text-xs"
                            dangerouslySetInnerHTML={{ __html: processedContent }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={className}>{children}</span>;
}
