import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Scale, Droplet, CheckCircle } from 'lucide-react';

interface ProfileResultsProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: {
    finalProfileType: string;
    riskLevel: string;
    recommendedProducts: string;
    investmentStrategy: string;
    resultData?: string;
    createdAt?: string;
  } | null;
}

const ProfileResults: React.FC<ProfileResultsProps> = ({ isOpen, onClose, profileData }) => {
  if (!profileData) return null;

  // Función para obtener la configuración del portafolio basada en el perfil
  const getPortfolioConfig = (profileType: string) => {
    const profiles = {
      'agresivo': {
        aggressive: 70,
        moderate: 20,
        liquidity: 10,
        icon: TrendingUp,
        color: 'text-red-600'
      },
      'moderado': {
        aggressive: 40,
        moderate: 35,
        liquidity: 25,
        icon: Scale,
        color: 'text-yellow-600'
      },
      'conservador': {
        aggressive: 20,
        moderate: 30,
        liquidity: 50,
        icon: Droplet,
        color: 'text-blue-600'
      },
      'planificador': {
        aggressive: 40,
        moderate: 35,
        liquidity: 25,
        icon: Scale,
        color: 'text-green-600'
      }
    };

    const normalizedProfile = profileType.toLowerCase();
    return profiles[normalizedProfile as keyof typeof profiles] || profiles['moderado'];
  };

  const portfolioConfig = getPortfolioConfig(profileData.finalProfileType);

  const portfolioItems = [
    {
      percentage: portfolioConfig.aggressive,
      title: 'Portafolio Agresivo',
      description: 'Acciones internacionales y locales',
      icon: TrendingUp,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    },
    {
      percentage: portfolioConfig.moderate,
      title: 'Portafolio Moderado',
      description: 'Fondos mixtos y bonos corporativos',
      icon: Scale,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      percentage: portfolioConfig.liquidity,
      title: 'Liquidez Estratégica',
      description: 'CDTs y fondos de liquidez',
      icon: Droplet,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    }
  ];

  const benefits = [
    'Rentabilidad esperada: 12-15% anual',
    'Rebalanceo automático',
    'Diversificación internacional',
    'Asesoría especializada'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-800">
            Tu Portafolio Personalizado - Inversor con Propósito
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Basado en tu experiencia y expectativas
          </p>
        </DialogHeader>

        <div className="space-y-6 p-2">
          {/* Perfil y Nivel de Riesgo */}
          <div className="text-center space-y-2">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Perfil: {profileData.finalProfileType}
            </Badge>
          </div>

          {/* Distribución del Portafolio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {portfolioItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <Card key={index} className={`${item.bgColor} border-none`}>
                  <CardContent className="p-4 text-center">
                    <IconComponent className={`h-8 w-8 mx-auto mb-2 ${item.textColor}`} />
                    <div className={`text-3xl font-bold ${item.textColor} mb-1`}>
                      {item.percentage}%
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Beneficios del Plan */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Beneficios de tu plan:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Productos Recomendados */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Productos Recomendados:</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {profileData.recommendedProducts}
            </p>
          </div>

          {/* Estrategia de Inversión */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Estrategia de Inversión:</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {profileData.investmentStrategy}
            </p>
          </div>

  

          {/* Información adicional */}
          {profileData.createdAt && (
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              Perfil creado: {new Date(profileData.createdAt).toLocaleDateString('es-ES')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileResults;