
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lead } from '@/types/crm';
import { EmailTemplate } from '@/types/email';

interface EmailPreviewProps {
  leads: Lead[];
  template: EmailTemplate;
  replaceDynamicFields: (template: string, lead: Lead) => string;
  maxPreviews?: number;
  alternateEmail?: string;
}

export function EmailPreview({ 
  leads, 
  template, 
  replaceDynamicFields, 
  maxPreviews = 1,
  alternateEmail 
}: EmailPreviewProps) {
  const previewLeads = leads.slice(0, maxPreviews);

  if (previewLeads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previsualización</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No hay leads seleccionados para previsualizar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Previsualización de Emails
          <Badge variant="secondary">
            {leads.length} de {leads.length} leads
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Mostrando una vista previa del correo que se enviaría
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {previewLeads.map((lead, index) => {
            const processedSubject = replaceDynamicFields(template.subject, lead);
            const processedContent = replaceDynamicFields(template.htmlContent, lead);
            
            // Para envíos individuales, mostrar el email alternativo si está especificado
            const displayEmail = (leads.length === 1 && alternateEmail?.trim()) 
              ? alternateEmail.trim() 
              : lead.email;

            return (
              <Card key={lead.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{displayEmail}</p>
                      {leads.length === 1 && alternateEmail?.trim() && alternateEmail !== lead.email && (
                        <p className="text-xs text-blue-600 mt-1">
                          Email alternativo especificado
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        ASUNTO:
                      </Label>
                      <p className="font-medium">{processedSubject}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium text-muted-foreground">
                        CONTENIDO:
                      </Label>
                      <div 
                        className="border rounded p-3 bg-muted/30 text-sm"
                        dangerouslySetInnerHTML={{ __html: processedContent }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {leads.length > maxPreviews && (
          <div className="mt-4 p-3 bg-muted rounded-xl text-center">
            <p className="text-sm text-muted-foreground">
              ... y {leads.length - maxPreviews} correos más se enviarían con el mismo formato
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={className}>
      {children}
    </span>
  );
}
