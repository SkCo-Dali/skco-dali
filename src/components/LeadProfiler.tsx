
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Home, Target, ArrowRight } from 'lucide-react';
import { LeadProfilerProps } from '@/types/leadProfiler';

export const LeadProfiler: React.FC<LeadProfilerProps> = ({
  selectedLead
}) => {
  return (
    <div className="min-h-[600px] bg-gray-50 p-6 m-4">
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
          <Button className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-md font-medium flex items-center justify-center gap-2">
            Iniciar Sesión de Perfilado
            <ArrowRight className="h-5 w-5" />
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
          </div>
        </div>
      </div>
    </div>
  );
};
