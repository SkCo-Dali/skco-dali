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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useToast } from '@/hooks/use-toast';
import { emailTemplatesService } from '@/services/emailTemplatesService';
import { EmailTemplateData, EmailTemplateCategory } from '@/types/emailTemplates';
import { Search, Loader2, FileText, Trash2, CheckCircle } from 'lucide-react';
import Autoplay from "embla-carousel-autoplay";

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
  const autoplayPlugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

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
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[autoplayPlugin.current]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {filteredTemplates.map((template) => (
                  <CarouselItem key={template.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <Card
                      className="group relative cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden h-full"
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
                          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-fade-in"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHoveredTemplate(null);
                          }}
                        >
                          <div className="relative w-full h-full" onClick={(e) => e.stopPropagation()}>
                            {/* Template name overlay - top right */}
                            <div className="absolute top-4 right-4 z-10 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border animate-slide-in-right">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm">{template.template_name}</h4>
                                <Badge variant={template.is_system_template ? "secondary" : "default"}>
                                  {template.type === 'system' ? "Sistema" : "Propia"}
                                </Badge>
                              </div>
                            </div>

                            {/* Subject overlay - bottom */}
                            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur-sm px-6 py-3 rounded-lg shadow-lg border max-w-2xl animate-fade-in">
                              <p className="text-sm text-center">
                                <span className="font-medium">Asunto: </span>
                                {template.subject}
                              </p>
                            </div>

                            {/* Action buttons - bottom center */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2 animate-fade-in">
                              <Button
                                onClick={() => handleSelectTemplate(template)}
                                size="lg"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Usar esta plantilla
                              </Button>
                              {template.type === 'own' && (
                                <Button
                                  variant="destructive"
                                  size="lg"
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

                            {/* HTML Content - full screen with scroll */}
                            <ScrollArea className="h-full w-full">
                              <div className="flex items-start justify-center min-h-full p-8">
                                <div 
                                  className="bg-white shadow-2xl max-w-4xl w-full animate-scale-in"
                                  dangerouslySetInnerHTML={{ __html: template.html_content }}
                                />
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      )}
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
