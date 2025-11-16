import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { emailTemplatesService } from '@/services/emailTemplatesService';
import { EmailTemplateData, EmailTemplateCategory } from '@/types/emailTemplates';
import { Search, Loader2, FileText, Trash2, CheckCircle } from 'lucide-react';

interface EmailTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: { subject: string; htmlContent: string; plainContent: string }) => void;
}

export function EmailTemplatesModal({
  open,
  onOpenChange,
  onSelectTemplate,
}: EmailTemplatesModalProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplateData[]>([]);
  const [categories, setCategories] = useState<EmailTemplateCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [templateType, setTemplateType] = useState<'all' | 'own' | 'system'>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (hoveredTemplate) {
      setIsCarouselPaused(true);
    } else {
      setIsCarouselPaused(false);
    }
  }, [hoveredTemplate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [templatesData, categoriesData] = await Promise.all([
        emailTemplatesService.getTemplates({
          template_type: templateType,
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
        }),
        emailTemplatesService.getCategories(),
      ]);
      setTemplates(templatesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    const template = templates.find(t => t.id === templateId);
    
    if (template?.is_system_template) {
      toast({
        title: "Acción no permitida",
        description: "No puedes eliminar plantillas del sistema",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar la plantilla "${templateName}"?`)) {
      return;
    }

    try {
      await emailTemplatesService.deleteTemplate(templateId);
      setTemplates(templates.filter(t => t.id !== templateId));
      toast({
        title: "Éxito",
        description: "Plantilla eliminada correctamente",
      });
    } catch (error: any) {
      console.error('Error deleting template:', error);
      const errorMessage = error?.detail || error?.message || "No se pudo eliminar la plantilla";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleSelectTemplate = async (template: EmailTemplateData) => {
    try {
      const fullTemplate = await emailTemplatesService.getTemplateById(template.id);
      
      onSelectTemplate({
        subject: fullTemplate.subject,
        htmlContent: fullTemplate.html_content,
        plainContent: fullTemplate.plain_text_content || '',
      });

      onOpenChange(false);

      toast({
        title: "Plantilla aplicada",
        description: `La plantilla "${fullTemplate.template_name}" ha sido aplicada correctamente`,
      });
    } catch (error: any) {
      console.error('Error selecting template:', error);
      const errorMessage = error?.detail || error?.message || "No se pudo cargar la plantilla";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const filteredTemplates = templates;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Plantillas de Correo
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Buscar plantillas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      loadData();
                    }
                  }}
                  className="w-full"
                />
              </div>
              <Button onClick={loadData} disabled={isLoading}>
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Select 
                value={selectedCategory || 'all'} 
                onValueChange={(value) => {
                  setSelectedCategory(value === 'all' ? '' : value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.category} value={category.category}>
                      {category.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={templateType} 
                onValueChange={(value: 'all' | 'own' | 'system') => {
                  setTemplateType(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="own">Mis plantillas</SelectItem>
                  <SelectItem value="system">Del sistema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-2">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No se encontraron plantillas</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="group relative cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                    onMouseEnter={() => setHoveredTemplate(template.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                      <div 
                        className="w-full h-full p-4 text-xs overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: template.html_content }}
                        style={{ 
                          transform: 'scale(0.5)',
                          transformOrigin: 'top left',
                          width: '200%',
                          height: '200%'
                        }}
                      />
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm line-clamp-1">{template.template_name}</h4>
                        <Badge variant={template.is_system_template ? "secondary" : "default"} className="ml-2 shrink-0">
                          {template.type === 'system' ? "Sistema" : "Propia"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{template.subject}</p>
                      {template.category && (
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      )}
                    </div>

                    {hoveredTemplate === template.id && (
                      <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setHoveredTemplate(null);
                        }}
                      >
                        <Card 
                          className="w-[90vw] max-w-4xl max-h-[85vh] flex flex-col"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-6 space-y-4 flex flex-col h-full">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-xl mb-1">{template.template_name}</h4>
                                  <p className="text-sm text-muted-foreground">{template.subject}</p>
                                </div>
                                <Badge variant={template.is_system_template ? "secondary" : "default"}>
                                  {template.type === 'system' ? "Sistema" : "Propia"}
                                </Badge>
                              </div>
                              {template.category && (
                                <Badge variant="outline" className="text-xs">
                                  {template.category}
                                </Badge>
                              )}
                            </div>
                            
                            <ScrollArea className="flex-1 border rounded-lg">
                              <div 
                                className="p-6 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: template.html_content }}
                              />
                            </ScrollArea>

                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handleSelectTemplate(template)}
                                className="flex-1"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Usar esta plantilla
                              </Button>
                              {template.type === 'own' && (
                                <Button
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTemplate(template.id, template.template_name);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
