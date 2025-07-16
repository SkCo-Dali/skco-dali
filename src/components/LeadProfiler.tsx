
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, Clock, Lightbulb, FileText, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { LeadProfilerProps } from '@/types/leadProfiler';

export const LeadProfiler: React.FC<LeadProfilerProps> = ({
  selectedLead
}) => {
  const [sessionNotes, setSessionNotes] = useState('');
  const [financialGoals, setFinancialGoals] = useState('');
  const [riskTolerance, setRiskTolerance] = useState('');
  
  const profileTips = [
    "Escucha activamente las necesidades del cliente",
    "Identifica su situación financiera actual",
    "Evalúa su tolerancia al riesgo",
    "Determina sus objetivos a corto y largo plazo",
    "Recomienda productos acordes a su perfil"
  ];

  const financialQuestions = [
    {
      id: 1,
      question: "¿Cuál es su objetivo principal de inversión?",
      options: ["Ahorro", "Crecimiento", "Ingresos", "Preservación"]
    },
    {
      id: 2,
      question: "¿Cuál es su horizonte de inversión?",
      options: ["Corto plazo (1-3 años)", "Mediano plazo (3-7 años)", "Largo plazo (7+ años)"]
    },
    {
      id: 3,
      question: "¿Cómo reaccionaría ante una pérdida del 20% en su inversión?",
      options: ["Muy preocupado", "Preocupado", "Neutral", "Tranquilo", "Oportunidad de compra"]
    }
  ];

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Identificador del Cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-skandia-blue" />
            Identificador del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Nombre completo</Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {selectedLead?.name || 'No especificado'}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {selectedLead?.email || 'No especificado'}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Teléfono</Label>
              <div className="p-2 bg-muted rounded-md text-sm">
                {selectedLead?.phone || 'No especificado'}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Estado</Label>
              <Badge variant="secondary" className="text-xs">
                {selectedLead?.status || 'Nuevo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preparación de Sesión */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-skandia-blue" />
            Preparación de Sesión
          </CardTitle>
          <CardDescription>
            Información previa y notas para la sesión de prospección
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="session-notes" className="text-sm font-medium">
              Notas de la sesión
            </Label>
            <Textarea
              id="session-notes"
              placeholder="Escriba aquí las notas importantes de la sesión..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="financial-goals" className="text-sm font-medium">
                Objetivos financieros
              </Label>
              <Input
                id="financial-goals"
                placeholder="Ej: Jubilación, compra de vivienda..."
                value={financialGoals}
                onChange={(e) => setFinancialGoals(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="risk-tolerance" className="text-sm font-medium">
                Tolerancia al riesgo inicial
              </Label>
              <Input
                id="risk-tolerance"
                placeholder="Conservador, Moderado, Agresivo"
                value={riskTolerance}
                onChange={(e) => setRiskTolerance(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips para el Asesor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Tips para el Asesor
          </CardTitle>
          <CardDescription>
            Recomendaciones para una sesión exitosa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {profileTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Test de Perfil Financiero */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-skandia-blue" />
            Test de Perfil Financiero
          </CardTitle>
          <CardDescription>
            Cuestionario para determinar el perfil de inversión del cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {financialQuestions.map((question) => (
            <div key={question.id} className="space-y-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs">
                  {question.id}
                </Badge>
                <Label className="text-sm font-medium leading-relaxed">
                  {question.question}
                </Label>
              </div>
              <div className="ml-8 space-y-2">
                {question.options.map((option, index) => (
                  <label key={index} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      className="text-skandia-blue focus:ring-skandia-blue"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Resultado del Perfil */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-skandia-blue" />
            Resultado del Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Perfil recomendado</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete el cuestionario para obtener la recomendación de perfil financiero
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Guardar sesión
            </Button>
            <Button className="flex-1">
              Generar reporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
