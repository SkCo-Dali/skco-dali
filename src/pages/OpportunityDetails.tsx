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
          <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background via-background to-muted/20">
            <CardHeader className="pb-6">
              <div className="flex items-start gap-6">
                {/* Enhanced Icon */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center shadow-lg border border-primary/20">
                    <span className="text-4xl filter drop-shadow-sm">{opportunity.icon}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Title and Subtitle */}
                <div className="flex-1 space-y-3">
                  <div>
                    <CardTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                      {opportunity.title}
                    </CardTitle>
                    <p className="text-muted-foreground text-lg font-medium">{opportunity.subtitle}</p>
                  </div>
                  
                  {/* Priority and Type Badges */}
                  <div className="flex flex-wrap gap-3">
                    <Badge 
                      variant="outline" 
                      className={`${getPriorityColor(opportunity.priority)} font-semibold px-3 py-1`}
                    >
                      Prioridad {opportunity.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1">
                      {OPPORTUNITY_TYPE_LABELS[opportunity.type]}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Description */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full"></div>
                  Descripción
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base pl-3 border-l-2 border-muted">{opportunity.description}</p>
              </div>

              {/* Key Metrics - E-commerce Style */}
              {opportunity.metrics && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                    Datos Clave
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Clientes Impactables */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-300"></div>
                      <div className="relative bg-white/60 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-3">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-3xl font-bold text-blue-700 mb-1">
                          {formatCustomerCount(opportunity.metrics.conversionRate * 1000)}
                        </div>
                        <div className="text-sm font-medium text-blue-600">Clientes Impactables</div>
                      </div>
                    </div>
                    
                    {/* Comisiones Potenciales */}
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-2xl blur-xl group-hover:blur-lg transition-all duration-300"></div>
                      <div className="relative bg-white/60 backdrop-blur-sm border border-green-200/50 rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-3">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="text-3xl font-bold text-green-700 mb-1">
                          ${Math.round(opportunity.metrics.estimatedSales * 0.1).toLocaleString()}
                        </div>
                        <div className="text-sm font-medium text-green-600">Comisiones Potenciales</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              {opportunity.tags.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-base flex items-center gap-2">
                    <div className="w-0.5 h-4 bg-muted-foreground/50 rounded-full"></div>
                    Etiquetas
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="bg-muted/30 hover:bg-muted/50 transition-colors px-3 py-1">
                        {tag}
                      </Badge>
                    ))}
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
                  className="w-full justify-start h-auto py-3 px-4 text-left bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-200 group"
                  size="lg"
                >
                  <div className="flex items-center gap-3 w-full min-w-0">
                    <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="font-semibold text-sm leading-tight">Cargar como leads y enviar correo masivo</span>
                      <span className="text-xs opacity-90 mt-0.5">Acción recomendada</span>
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
                className="w-full justify-start h-auto py-3 px-4 text-left border-2 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-all duration-200 group"
                size="lg"
              >
                <div className="flex items-center gap-3 w-full min-w-0">
                  <div className="flex-shrink-0 p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium text-sm leading-tight">Cargar como leads y enviar WhatsApp masivo</span>
                    <span className="text-xs text-muted-foreground mt-0.5">Mensajería directa</span>
                  </div>
                </div>
              </Button>
              
              {/* Learning Action */}
              <Button 
                variant="secondary" 
                className="w-full justify-start h-auto py-3 px-4 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200 group"
                size="lg"
              >
                <div className="flex items-center gap-3 w-full min-w-0">
                  <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium text-sm leading-tight">Aprende a pedir esta base en Chat Dali</span>
                    <span className="text-xs text-blue-600 mt-0.5">Guía interactiva</span>
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