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
    <Card className="border-l-4 border-l-primary pb-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Previsualización de Emails
          <Badge variant="secondary">
            {selectedCount} de {leads.length} seleccionados
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground pb-2">Activa o desactiva el envío para cada destinatario</p>

        {/* Barra de búsqueda */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre, apellidos, correo, teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4 pb-4">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron destinatarios que coincidan con tu búsqueda
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
                    className={`border-l-4 pb-4 transition-all ${
                      isSelected ? "border-l-primary" : "border-l-gray-300 opacity-60"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <Switch
                            checked={isSelected}
                            onCheckedChange={() => onToggleLead(lead.id)}
                            aria-label={`Enviar correo a ${lead.name}`}
                          />
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-sm text-muted-foreground">{displayEmail}</p>
                            {leads.length === 1 && alternateEmail?.trim() && alternateEmail !== lead.email && (
                              <p className="text-xs text-blue-600 mt-1">Email alternativo especificado</p>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">#{index + 1}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">ASUNTO:</Label>
                          <p className="font-medium">{processedSubject}</p>
                        </div>

                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">CONTENIDO:</Label>
                          <div
                            className="border rounded p-3 bg-muted/30 text-sm"
                            style={{
                              lineHeight: '1.6'
                            }}
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
