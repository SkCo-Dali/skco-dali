import React from 'react';
import { X, Users, TrendingUp, Calendar, Target, Mail, MessageCircle, Phone, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IOpportunity, OPPORTUNITY_TYPE_LABELS, PRIORITY_COLORS } from '@/types/opportunities';
import { opportunitiesService } from '@/services/mock/opportunitiesService';
import { useToast } from '@/hooks/use-toast';

interface OpportunityDetailsModalProps {
  opportunity: IOpportunity | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OpportunityDetailsModal: React.FC<OpportunityDetailsModalProps> = ({
  opportunity,
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = React.useState(false);

  React.useEffect(() => {
    if (opportunity) {
      setIsFavorite(opportunitiesService.isFavorite(opportunity.id));
    }
  }, [opportunity]);

  const handleFavoriteToggle = () => {
    if (!opportunity) return;
    
    const newFavoriteState = opportunitiesService.toggleFavorite(opportunity.id);
    setIsFavorite(newFavoriteState);
    
    toast({
      title: newFavoriteState ? "Agregado a favoritas" : "Removido de favoritas",
      description: opportunity.title,
      duration: 2000,
    });
  };

  if (!opportunity) return null;

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.baja;
  };

  const formatCustomerCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Detalles de Oportunidad</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
              className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
            >
              <Heart 
                className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
              />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Opportunity Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="text-3xl w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
                    {opportunity.icon}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{opportunity.title}</CardTitle>
                    <p className="text-muted-foreground text-sm">{opportunity.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Descripción</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{opportunity.description}</p>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Clasificación</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(opportunity.priority)}
                    >
                      Prioridad {opportunity.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary">
                      {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
                    </Badge>
                    {opportunity.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Metrics */}
                {opportunity.metrics && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Métricas Proyectadas</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-muted/50 rounded-xl">
                        <div className="text-lg font-bold text-primary">{opportunity.metrics.conversionRate}%</div>
                        <div className="text-xs text-muted-foreground">Conversión</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-xl">
                        <div className="text-lg font-bold text-blue-600">{opportunity.metrics.ctrEstimated}%</div>
                        <div className="text-xs text-muted-foreground">CTR Estimado</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-xl">
                        <div className="text-lg font-bold text-green-600">${opportunity.metrics.estimatedSales.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Ventas Est.</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Key Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Información Clave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Score de Impacto</span>
                  <span className="font-bold text-primary">{opportunity.score}/100</span>
                </div>
                <Progress value={opportunity.score} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Clientes Impactables</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{formatCustomerCount(opportunity.customerCount)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-muted-foreground text-sm">Producto Sugerido</span>
                  <Badge variant="outline" className="w-full justify-center text-xs">
                    {opportunity.suggestedProduct}
                  </Badge>
                </div>

                {opportunity.segment && (
                  <div className="space-y-2">
                    <span className="text-muted-foreground text-sm">Segmento</span>
                    <Badge variant="secondary" className="w-full justify-center text-xs">
                      {opportunity.segment}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};