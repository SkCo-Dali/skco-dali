import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Scale, Droplet, CheckCircle } from 'lucide-react';
import { STRATEGIC_PLAN_CONFIG, FlowType } from './StrategicPlanConfig';
import { formatBogotaDate } from '@/utils/dateUtils';

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

  // Función para mapear perfil a tipo de flujo estratégico
  const getFlowTypeFromProfile = (profileType: string): FlowType | 'nightmare' => {
    const profileMapping: Record<string, FlowType | 'nightmare'> = {
      'familiar': 'family', 
      'maduro': 'preserve',
      'planificador': 'multiply',
      'inmediatista': 'nightmare'
    };

    const normalizedProfile = profileType.toLowerCase();
    return profileMapping[normalizedProfile] || 'family';
  };

  const flowType = getFlowTypeFromProfile(profileData.finalProfileType);
  
  // Configuración para nightmare plan
  const NIGHTMARE_PLAN_CONFIG = {
    title: "Tu Plan Sin Complicaciones",
    subtitle: "Automatizado y eficiente",
    components: [
      {
        name: "Ahorro Automático",
        percentage: "60%",
        description: "Inversión mensual automática",
        icon: "🔄"
      },
      {
        name: "Fondo de Emergencias",
        percentage: "25%",
        description: "3 meses de gastos cubiertos",
        icon: "🛏️"
      },
      {
        name: "Fondo para Gustos",
        percentage: "15%",
        description: "Para tus placeres sin culpa",
        icon: "🎁"
      }
    ],
    benefits: [
      "Todo automático, sin esfuerzo",
      "Metas alcanzables mes a mes",
      "Disfruta sin culpa",
      "Asesoría cuando la necesites"
    ]
  };

  const strategicPlan = flowType === 'nightmare' ? NIGHTMARE_PLAN_CONFIG : STRATEGIC_PLAN_CONFIG[flowType as FlowType];

  // Configuración de colores por componente
  const componentColors = [
    { bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { bgColor: 'bg-yellow-50', textColor: 'text-yellow-600' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-gray-800">
            {strategicPlan.title}
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            {strategicPlan.subtitle}
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
            {strategicPlan.components.map((component, index) => {
              const colors = componentColors[index] || componentColors[0];
              return (
                <Card key={index} className={`${colors.bgColor} border-none`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">{component.icon}</div>
                    <div className={`text-3xl font-bold ${colors.textColor} mb-1`}>
                      {component.percentage}
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">
                      {component.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {component.description}
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
              {strategicPlan.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Productos Recomendados 
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Productos Recomendados:</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {profileData.recommendedProducts}
            </p>
          </div>

          {/* Estrategia de Inversión 
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Estrategia de Inversión:</h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {profileData.investmentStrategy}
            </p>
          </div>*/}

  

          {/* Información adicional */}
          {profileData.createdAt && (
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              Perfil creado: {formatBogotaDate(profileData.createdAt)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileResults;