import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Heart,
  RefreshCw,
  Mail,
  MessageSquare,
  GraduationCap
} from 'lucide-react';
import { IOpportunity, OPPORTUNITY_TYPE_LABELS, PRIORITY_COLORS } from '@/types/opportunities';
import { opportunitiesService } from '@/services/mock/opportunitiesService';
import { useToast } from '@/hooks/use-toast';

export const OpportunityDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = React.useState<IOpportunity | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isFavorite, setIsFavorite] = React.useState(false);

  const loadOpportunity = React.useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const opportunityData = await opportunitiesService.getOpportunityById(id);
      
      if (opportunityData) {
        setOpportunity(opportunityData);
        setIsFavorite(opportunitiesService.isFavorite(id));
      } else {
        setError('Oportunidad no encontrada');
      }
    } catch (err) {
      setError('Error al cargar la oportunidad');
      console.error('Error loading opportunity:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadOpportunity();
  }, [loadOpportunity]);

  const handleBack = () => {
    navigate('/oportunidades');
  };

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

  const handleRetry = () => {
    loadOpportunity();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-5 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="container mx-auto px-4 py-5">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Detalles de Oportunidad</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
    <div className="container mx-auto px-4 py-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalles de Oportunidad</h1>
            <p className="text-muted-foreground">Información completa de la oportunidad comercial</p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteToggle}
          className="h-10 w-10 hover:bg-red-50 hover:text-red-500"
        >
          <Heart 
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
          />
        </Button>
      </div>

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
                  <CardTitle className="text-xl mb-2">{opportunity.title}</CardTitle>
                  <p className="text-muted-foreground">{opportunity.subtitle}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed">{opportunity.description}</p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <h4 className="font-medium">Clasificación</h4>
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
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              {opportunity.metrics && (
                <div className="space-y-4">
                  <h4 className="font-medium">Métricas Proyectadas</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-xl">
                      <div className="text-xl font-bold text-primary">{opportunity.metrics.conversionRate}%</div>
                      <div className="text-sm text-muted-foreground">Conversión</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-xl">
                      <div className="text-xl font-bold text-blue-600">{opportunity.metrics.ctrEstimated}%</div>
                      <div className="text-sm text-muted-foreground">CTR Estimado</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-xl">
                      <div className="text-xl font-bold text-green-600">${opportunity.metrics.estimatedSales.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Ventas Est.</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="shadow-lg border-0 bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                ¿Qué puedo hacer?
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Acciones disponibles para esta oportunidad
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Primary Action - Email */}
              <div className="relative">
                <Button 
                  variant="default" 
                  className="w-full justify-start h-auto py-4 px-5 text-left bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200 group"
                  size="lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Cargar como leads y enviar correo masivo</span>
                      <span className="text-xs opacity-90">Acción recomendada</span>
                    </div>
                  </div>
                </Button>
                <div className="absolute -top-2 -right-2">
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    PRINCIPAL
                  </div>
                </div>
              </div>
              
              {/* Secondary Action - WhatsApp */}
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-4 px-5 text-left border-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200 group"
                size="lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Cargar como leads y enviar WhatsApp masivo</span>
                    <span className="text-xs text-muted-foreground">Mensajería directa</span>
                  </div>
                </div>
              </Button>
              
              {/* Learning Action */}
              <Button 
                variant="secondary" 
                className="w-full justify-start h-auto py-4 px-5 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 group"
                size="lg"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Aprende a pedir esta base en Chat Dali</span>
                    <span className="text-xs text-blue-600">Guía interactiva</span>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
};