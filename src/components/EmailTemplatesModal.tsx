import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Search, Loader2, FileText, Trash2, CheckCircle2 } from 'lucide-react';

interface EmailTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: EmailTemplateData) => void;
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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templateType, setTemplateType] = useState<string>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
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
      const data = await emailTemplatesService.getTemplates();
      setTemplates(data.templates);
      setCategories(data.categories);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las plantillas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string, isSystem: boolean) => {
    if (isSystem) {
      toast({
        title: 'No permitido',
        description: 'No puedes eliminar plantillas del sistema',
        variant: 'destructive',
      });
      return;
    }

    try {
      await emailTemplatesService.deleteTemplate(templateId);
      setTemplates(templates.filter((t) => t.id !== templateId));
      toast({
        title: 'Plantilla eliminada',
        description: 'La plantilla se eliminó exitosamente',
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la plantilla',
        variant: 'destructive',
      });
    }
  };

  const handleSelectTemplate = async (template: EmailTemplateData) => {
    setSelectedTemplateId(template.id);
    
    try {
      await emailTemplatesService.recordUsage(template.id);
      onSelectTemplate(template);
      onOpenChange(false);
      
      toast({
        title: 'Plantilla aplicada',
        description: `Se ha aplicado la plantilla "${template.name}"`,
      });
    } catch (error) {
      console.error('Error recording usage:', error);
      // Still apply the template even if recording fails
      onSelectTemplate(template);
      onOpenChange(false);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || template.categoryId === selectedCategory;

    const matchesType =
      templateType === 'all' ||
      (templateType === 'system' && template.isSystem) ||
      (templateType === 'user' && !template.isSystem);

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Plantillas de Correo</DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nombre o asunto..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="user">Mis plantillas</SelectItem>
                <SelectItem value="system">Del sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Templates Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No se encontraron plantillas</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                    hoveredTemplate === template.id
                      ? 'ring-2 ring-primary scale-105 shadow-lg z-10'
                      : 'hover:shadow-md'
                  }`}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                >
                  <div className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{template.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {template.subject}
                        </p>
                      </div>
                      {!template.isSystem && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id, template.isSystem);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Preview */}
                    <div
                      className={`bg-muted rounded-md p-3 text-xs transition-all duration-300 ${
                        hoveredTemplate === template.id ? 'h-48' : 'h-24'
                      } overflow-hidden`}
                    >
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html:
                            hoveredTemplate === template.id
                              ? template.htmlContent
                              : template.htmlContent.substring(0, 150) + '...',
                        }}
                      />
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={template.isSystem ? 'secondary' : 'default'}>
                        {template.isSystem ? 'Sistema' : 'Propia'}
                      </Badge>
                      <Badge variant="outline">{template.categoryName || 'Sin categoría'}</Badge>
                      {template.usageCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {template.usageCount} usos
                        </Badge>
                      )}
                    </div>

                    {/* Action Button (shown on hover) */}
                    {hoveredTemplate === template.id && (
                      <Button
                        className="w-full"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Usar esta plantilla
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
