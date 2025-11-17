import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
import { Search, Loader2, FileText, Trash2, X } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateData | null>(null);

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

  const handleTemplateClick = (template: EmailTemplateData) => {
    setSelectedTemplate(template);
  };

  const closePreview = () => {
    setSelectedTemplate(null);
  };

  const handleUseTemplate = async (template: EmailTemplateData) => {
    try {
      const fullTemplate = await emailTemplatesService.getTemplateById(template.id);
      
      onSelectTemplate({
        subject: fullTemplate.subject,
        htmlContent: fullTemplate.html_content,
        plainContent: fullTemplate.plain_text_content || '',
      });

      onOpenChange(false);
      setSelectedTemplate(null);

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
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col bg-muted/30">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6" />
              Plantillas de Correo
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-6">
            {/* Filtros */}
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

            {/* Carrusel */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-lg font-semibold">No se encontraron plantillas</p>
                    <p className="text-sm text-muted-foreground">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 -mx-6 px-6">
                <Swiper
                  modules={[Navigation, Pagination]}
                  loop={true}
                  grabCursor={true}
                  spaceBetween={16}
                  breakpoints={{
                    0: {
                      slidesPerView: 1.3,
                      spaceBetween: 12,
                      navigation: { enabled: false },
                    },
                    480: {
                      slidesPerView: 2.2,
                      spaceBetween: 14,
                      navigation: { enabled: false },
                    },
                    768: {
                      slidesPerView: 3.2,
                      spaceBetween: 16,
                      navigation: { enabled: false },
                    },
                    1024: {
                      slidesPerView: 4,
                      spaceBetween: 18,
                      navigation: { enabled: true },
                    }
                  }}
                  className="w-full h-full"
                >
                  {filteredTemplates.map((template) => (
                    <SwiperSlide key={template.id}>
                      <Card
                        className="group cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl overflow-hidden bg-card/80 backdrop-blur border-border/50 h-full"
                        onClick={() => handleTemplateClick(template)}
                      >
                        {/* Miniatura */}
                        <div className="w-full aspect-[3/4] rounded-t-xl overflow-hidden bg-muted">
                          <div 
                            className="w-full h-full p-2 text-xs overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: template.html_content }}
                            style={{ 
                              transform: 'scale(0.3)',
                              transformOrigin: 'top left',
                              width: '333.33%',
                              height: '333.33%'
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="p-3 space-y-2">
                          <h4 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                            {template.template_name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {template.subject}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            <Badge 
                              variant={template.is_system_template ? "secondary" : "default"} 
                              className="text-xs"
                            >
                              {template.type === 'system' ? "Sistema" : "Propia"}
                            </Badge>
                            {template.category && (
                              <Badge variant="outline" className="text-xs">
                                {template.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {selectedTemplate &&
        createPortal(
          <div 
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closePreview}
          >
            <div 
              className="relative max-h-[90vh] w-full max-w-4xl mx-4 overflow-hidden rounded-2xl bg-background shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                className="absolute right-4 top-4 z-10 rounded-full bg-black/60 hover:bg-black/80 p-2 text-white transition-colors"
                onClick={closePreview}
              >
                <X className="h-4 w-4" />
              </button>

              {/* Contenido con scroll */}
              <ScrollArea className="max-h-[90vh]">
                <div className="p-6 md:p-8">
                  {/* HTML de la plantilla */}
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.html_content }}
                  />

                  {/* Barra de acciones */}
                  <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row gap-3 sm:justify-end">
                    <Button
                      size="lg"
                      onClick={() => handleUseTemplate(selectedTemplate)}
                    >
                      Usar esta plantilla
                    </Button>
                    {selectedTemplate.type === 'own' && (
                      <Button
                        variant="destructive"
                        size="lg"
                        onClick={() => {
                          handleDeleteTemplate(selectedTemplate.id, selectedTemplate.template_name);
                          closePreview();
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}
