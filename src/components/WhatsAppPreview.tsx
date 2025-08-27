
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone } from 'lucide-react';
import { Lead } from '@/types/crm';
import { WhatsAppTemplate } from '@/types/whatsapp';

interface WhatsAppPreviewProps {
  leads: Lead[];
  template: WhatsAppTemplate;
  replaceTemplateVariables: (template: WhatsAppTemplate, lead: Lead) => string;
}

export function WhatsAppPreview({
  leads,
  template,
  replaceTemplateVariables
}: WhatsAppPreviewProps) {
  const previewLeads = leads.slice(0, 10); // Mostrar máximo 10

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Previsualización de Mensajes
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Mostrando {previewLeads.length} de {leads.length} mensajes
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {previewLeads.map((lead, index) => (
            <div
              key={lead.id}
              className="border rounded-xl p-4 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    #{index + 1}
                  </Badge>
                  <span className="font-medium text-sm">{lead.name}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {lead.phone}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border-l-4 border-[#25D366]">
                <p className="text-sm whitespace-pre-wrap">
                  {replaceTemplateVariables(template, lead)}
                </p>
              </div>
            </div>
          ))}
          
          {leads.length > 10 && (
            <div className="text-center text-sm text-muted-foreground p-4 border rounded-xl">
              ... y {leads.length - 10} mensajes más
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
