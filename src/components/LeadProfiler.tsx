
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Target, ArrowRight, Loader2 } from 'lucide-react';
import { LeadProfilerProps } from '@/types/leadProfiler';
import { ProfilingSession } from './ProfilingSession';
import { useProfilingApi } from '@/hooks/useProfilingApi';

export const LeadProfiler: React.FC<LeadProfilerProps> = ({
  selectedLead,
  onBack
}) => {
  const [showSession, setShowSession] = useState(false);
  const { loading, checkClient, currentProfileId } = useProfilingApi();
  const [clientStatus, setClientStatus] = useState<{
    hasProfile: boolean;
    isCompleted?: boolean;
    profileId: string | null;
  } | null>(null);

  // Verificar si el cliente ya tiene perfil al cargar el componente
  useEffect(() => {
    if (selectedLead?.email || selectedLead?.documentNumber) {
      checkClientProfile();
    }
  }, [selectedLead]);

  const checkClientProfile = async () => {
    if (!selectedLead) return;
    
    const result = await checkClient(
      selectedLead.email,
      selectedLead.documentNumber?.toString()
    );
    
    if (result) {
      setClientStatus(result);
    }
  };

  const handleStartSession = () => {
    // Si tiene perfil completado, mostrar opción de nuevo perfil
    if (clientStatus?.hasProfile && clientStatus?.isCompleted) {
      const confirmNew = window.confirm(
        'El cliente ya tiene un perfil completado. ¿Desea crear uno nuevo?'
      );
      if (!confirmNew) return;
    }
    
    setShowSession(true);
  };

  if (showSession) {
    return (
      <ProfilingSession 
        selectedLead={selectedLead}
        onBack={() => {
          setShowSession(false);
          if (onBack) onBack();
        }}
      />
    );
  }

  return (
    <div className="min-h-[600px] bg-gray-50 p-6 m-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl text-lg font-bold text-gray-900">Sesión de prospección</h1>
            <p className="text-gray-600 text-sm">Preparación para cliente</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Identificador del Cliente */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Identificador del Cliente</h3>
              <div className="bg-white rounded-lg p-4 border">
                <p className="text-sm font-medium text-gray-900">
                  {selectedLead?.name || 'No registra nombre'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preparación de la sesión */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Preparación de la sesión:</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Duración estimada:</span>
                    <span className="text-sm text-gray-700 ml-1">5-7 minutos</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Objetivo:</span>
                    <span className="text-sm text-gray-700 ml-1">Identificar perfil financiero del cliente</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">Modalidad:</span>
                    <span className="text-sm text-gray-700 ml-1">Conversacional con apoyo visual</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips para la sesión */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4">Tips para la sesión:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-sm">😊</span>
                <span className="text-sm text-gray-700">Observa reacciones no verbales</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm">⏰</span>
                <span className="text-sm text-gray-700">Permite que se tome su tiempo para responder</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm">💬</span>
                <span className="text-sm text-gray-700">Aclara dudas sin influir en las respuestas</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm">📝</span>
                <span className="text-sm text-gray-700">Toma notas de comentarios adicionales</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm">⏸️</span>
                <span className="text-sm text-gray-700">Puedes pausar para profundizar en respuestas</span>
              </div>
            </div>
          </div>

          {/* Button */}
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-md font-medium flex items-center justify-center gap-2"
            onClick={handleStartSession}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verificando cliente...
              </>
            ) : (
              <>
                {clientStatus?.hasProfile && clientStatus?.isCompleted 
                  ? 'Crear Nuevo Perfil' 
                  : 'Iniciar Sesión de Perfilado'
                }
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Test de Perfil Financiero */}
          <div className="text-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-10 w-10 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Test de Perfil Financiero</h3>
            <p className="text-gray-600 mb-4">Vista previa de lo que verá el cliente</p>
            <p className="text-lg font-medium text-gray-900">1 pregunta para personalizar la experiencia</p>
            
            {/* Mostrar estado del cliente */}
            {clientStatus && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  {clientStatus.hasProfile 
                    ? clientStatus.isCompleted 
                      ? '✅ Cliente con perfil completado'
                      : '⚠️ Cliente con perfil en progreso'
                    : '🆕 Cliente nuevo'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
