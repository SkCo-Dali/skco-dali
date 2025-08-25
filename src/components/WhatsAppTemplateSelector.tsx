
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { WhatsAppTemplate } from '@/types/whatsapp';

interface WhatsAppTemplateSelectorProps {
  templates: WhatsAppTemplate[];
  selectedTemplate: WhatsAppTemplate | null;
  onSelectTemplate: (template: WhatsAppTemplate) => void;
  isLoading?: boolean;
}

export function WhatsAppTemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
  isLoading = false
}: WhatsAppTemplateSelectorProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Seleccionar Plantilla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C73D]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Seleccionar Plantilla
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No hay plantillas disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Seleccionar Plantilla Aprobada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id
                  ? 'ring-2 ring-[#00C73D] border-[#00C73D]'
                  : 'border-gray-200'
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {template.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {template.isApproved && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Aprobada
                      </Badge>
                    )}
                    {selectedTemplate?.id === template.id && (
                      <Badge className="text-xs bg-[#00C73D]">
                        Seleccionada
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.content}
                </p>
                {template.variables.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.variables.map((variable, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {selectedTemplate && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Plantilla Seleccionada:</h4>
            <p className="text-sm text-green-700">{selectedTemplate.content}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
