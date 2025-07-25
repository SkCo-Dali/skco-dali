
import { useState, useEffect, useRef, memo } from 'react';
import { Card, CardContent } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel';
import { PromptTemplate } from '../types/templates';
import { useIsMobile } from '../hooks/use-mobile';

interface PromptCarouselProps {
  templates: PromptTemplate[];
  onSelectTemplate: (content: string) => void;
}

// Memoize el componente para evitar re-renders innecesarios
export const PromptCarousel: React.FC<PromptCarouselProps> = memo(({ 
  templates, 
  onSelectTemplate 
}) => {
  console.log('🟢 PromptCarousel: Component rendered');
  console.log('🟢 PromptCarousel: Received templates:', templates);
  console.log('🟢 PromptCarousel: Templates count:', templates.length);

  const [api, setApi] = useState<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Handle wheel scroll for desktop - detect horizontal scroll from trackpad
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (scrollContainerRef.current && !isMobile) {
        // Check if it's horizontal scroll (deltaX) or if shift key is pressed with vertical scroll
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          // Use deltaX for horizontal scroll, or deltaY when shift is pressed
          const scrollAmount = e.shiftKey ? e.deltaY : e.deltaX;
          scrollContainerRef.current.scrollLeft += scrollAmount;
        }
      }
    };

    const container = scrollContainerRef.current;
    if (container && !isMobile) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [isMobile]);

  // Prevenir zoom en móvil que afecta el carrusel
  useEffect(() => {
    if (isMobile) {
      const preventDefault = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };

      const preventZoom = (e: WheelEvent) => {
        if (e.ctrlKey) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchstart', preventDefault, { passive: false });
      document.addEventListener('wheel', preventZoom, { passive: false });

      return () => {
        document.removeEventListener('touchstart', preventDefault);
        document.removeEventListener('wheel', preventZoom);
      };
    }
  }, [isMobile]);

  const handleTemplateClick = (template: PromptTemplate) => {
    console.log('🟢 PromptCarousel: Template clicked:', template);
    console.log('🟢 PromptCarousel: Template content:', template.content);
    onSelectTemplate(template.content);
    console.log('🟢 PromptCarousel: onSelectTemplate called with:', template.content);
  };

  if (templates.length === 0) {
    console.log('🔴 PromptCarousel: No templates provided, returning null');
    return null;
  }

  console.log('🟢 PromptCarousel: About to render carousel with', templates.length, 'templates');

  // Mobile version - usando scroll horizontal contenido con tamaños fijos
  if (isMobile) {
    console.log('🟢 PromptCarousel: Rendering mobile version');
    return (
      <TooltipProvider delayDuration={300}>
        <div className="w-full px-4 py-2">
          <div 
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              // Fijar el comportamiento independientemente del zoom
              transform: 'translateZ(0)',
              willChange: 'scroll-position'
            }}
          >
            {templates.slice(0, 6).map((template, index) => {
              console.log('🟢 PromptCarousel: Rendering mobile template', index, ':', template.name);
              return (
                <div 
                  key={template.id} 
                  className="flex-none"
                  style={{ 
                    scrollSnapAlign: 'start',
                    // Usar unidades fijas para evitar problemas con el zoom
                    width: '220px',
                    minWidth: '220px',
                    maxWidth: '220px'
                  }}
                >
                  <Card 
                    className="cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-200 bg-white group h-full min-h-[100px]"
                    onClick={() => handleTemplateClick(template)}
                    style={{
                      // Asegurar que el card mantenga su tamaño
                      width: '100%',
                      height: 'auto'
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-900 leading-tight">
                          {template.name}
                        </h4>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                          {template.content.length > 65 
                            ? `${template.content.substring(0, 65)}...`
                            : template.content
                          }
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Desktop version with native horizontal scroll
  console.log('🟢 PromptCarousel: Rendering desktop version');
  return (
    <TooltipProvider delayDuration={300}>
      <div className="w-full max-w-7xl mx-auto px-4 py-4">
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              overflowY: 'hidden'
            }}
          >
            {templates.map((template, index) => {
              console.log('🟢 PromptCarousel: Rendering desktop template', index, ':', template.name);
              return (
                <div key={template.id} className="flex-none w-[280px]">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card 
                        className="cursor-pointer transition-all duration-200 hover:shadow-lg border border-gray-200 bg-white group h-full flex flex-col min-h-[120px]"
                        onClick={() => handleTemplateClick(template)}
                      >
                        <CardContent className="p-4 flex-1">
                          <div className="space-y-2 h-full flex flex-col">
                            <h4 className="text-sm font-medium text-gray-900 leading-tight">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed flex-1">
                              {template.content.length > 80 
                                ? `${template.content.substring(0, 80)}...`
                                : template.content
                              }
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="max-w-xs p-3 text-sm bg-gray-900 text-white border border-gray-700"
                    >
                      <div className="space-y-2">
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs opacity-90 leading-relaxed">{template.content}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si las props realmente cambiaron
  return prevProps.templates.length === nextProps.templates.length &&
         prevProps.templates.every((template, index) => 
           template.id === nextProps.templates[index]?.id
         );
});

PromptCarousel.displayName = 'PromptCarousel';
