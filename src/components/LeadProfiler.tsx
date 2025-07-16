
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Lead } from "@/types/crm";
import { 
  User, 
  Home, 
  Target, 
  ArrowRight, 
  CheckCircle,
  Clock,
  MessageCircle,
  Eye,
  Brain,
  FileText,
  Pause
} from "lucide-react";

interface LeadProfilerProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
}

type ProfilerView = "preparation" | "question";

interface ProfilePrediction {
  type: string;
  label: string;
  description: string;
}

const profilePredictions: ProfilePrediction[] = [
  { type: "A", label: "Inmediatista", description: "Busca resultados rápidos" },
  { type: "B", label: "Planificador", description: "Evalúa opciones cuidadosamente" },
  { type: "C", label: "Familiar", description: "Prioriza la seguridad familiar" },
  { type: "D", label: "Maduro", description: "Experiencia y estabilidad" }
];

const sessionTips = [
  { icon: "😊", text: "Observa reacciones no verbales" },
  { icon: "⏰", text: "Permite que se tome su tiempo para responder" },
  { icon: "🤔", text: "Aclara dudas sin influir en las respuestas" },
  { icon: "📝", text: "Toma notas de comentarios adicionales" },
  { icon: "⏸️", text: "Puedes pausar para profundizar en respuestas" }
];

const questionOptions = [
  { 
    id: "nightmare", 
    emoji: "😰", 
    text: "Que no me rinda es mi pesadilla. Gasto y luego veo.",
    color: "text-red-500"
  },
  { 
    id: "multiply", 
    emoji: "🧠", 
    text: "Quiero multiplicarlo, pero con inteligencia.",
    color: "text-pink-500"
  },
  { 
    id: "family", 
    emoji: "👨‍👩‍👧‍👦", 
    text: "Quiero que a mi familia no le falte nada.",
    color: "text-orange-500"
  },
  { 
    id: "preserve", 
    emoji: "💎", 
    text: "Quiero que lo que ya hice, no se pierda.",
    color: "text-blue-500"
  }
];

export function LeadProfiler({ lead, isOpen, onClose }: LeadProfilerProps) {
  const [currentView, setCurrentView] = useState<ProfilerView>("preparation");
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [sessionId] = useState(() => `session-${Date.now()}`);

  const handleStartProfiling = () => {
    setCurrentView("question");
  };

  const handleFinishProfiling = () => {
    // Aquí se procesaría la respuesta y se guardaría el perfil
    console.log("Perfil completado:", {
      leadId: lead.id,
      sessionId,
      answer: selectedAnswer,
      notes: additionalNotes
    });
    onClose();
  };

  const renderPreparationView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Sesión de prospección</h2>
            <p className="text-muted-foreground">Preparación para cliente</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <Home className="h-4 w-4 mr-2" />
          Inicio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Client Identifier */}
          <Card>
            <CardHeader>
              <h3 className="font-medium">Identificador del Cliente</h3>
            </CardHeader>
            <CardContent>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{lead.name}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Se ha generado automáticamente un identificador único para esta sesión.
              </p>
            </CardContent>
          </Card>

          {/* Session Preparation */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <h3 className="font-medium">Preparación de la sesión:</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm"><strong>Duración estimada:</strong> 5-7 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-sm"><strong>Objetivo:</strong> Identificar perfil financiero del cliente</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm"><strong>Modalidad:</strong> Conversacional con apoyo visual</span>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div>
            <h3 className="font-medium mb-3">Tips para la sesión:</h3>
            <div className="space-y-2">
              {sessionTips.map((tip, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <span className="text-lg">{tip.icon}</span>
                  <span>{tip.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <Button 
            onClick={handleStartProfiling}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            size="lg"
          >
            Iniciar Sesión de Perfilado
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Test de Perfil Financiero</h3>
            <p className="text-muted-foreground mb-4">Vista previa de lo que verá el cliente</p>
            <Badge variant="secondary" className="mb-6">
              1 pregunta para personalizar la experiencia
            </Badge>
          </div>

          {/* Profile Predictions */}
          <Card>
            <CardHeader>
              <h4 className="font-medium">Predicción de perfiles:</h4>
            </CardHeader>
            <CardContent className="space-y-2">
              {profilePredictions.map((profile) => (
                <div key={profile.type} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{profile.type}</span>
                  <span className="text-muted-foreground">{profile.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderQuestionView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Perfilando a: {lead.name}</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>0 respondidas</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Pregunta 1 de 1
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={100} className="h-2" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Advisor Guide */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium">Guía del asesor:</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Observa las reacciones y gestos del cliente. Toma nota de dudas o 
              comentarios adicionales.
            </p>
            <p className="text-sm italic text-muted-foreground">
              Esta pregunta revela la relación emocional del cliente con el dinero. 
              Presta atención a su lenguaje corporal.
            </p>
          </CardContent>
        </Card>

        {/* Right Column - Question */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-6">
              Cuando piensas en tu dinero, lo primero que te viene a la mente es...
            </h2>

            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              <div className="space-y-4">
                {questionOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.id} id={option.id} />
                    <Label htmlFor={option.id} className="flex items-center gap-3 cursor-pointer flex-1">
                      <span className="text-xl">{option.emoji}</span>
                      <span className={`text-sm ${option.color}`}>
                        "{option.text}"
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Button 
            onClick={handleFinishProfiling}
            disabled={!selectedAnswer}
            className="w-full bg-green-500 hover:bg-green-600"
            size="lg"
          >
            Finalizar
          </Button>
        </div>
      </div>

      {/* Bottom Section - Profile Predictions */}
      <Card>
        <CardHeader>
          <h3 className="font-medium">Predicción de perfiles:</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            {profilePredictions.map((profile) => (
              <div key={profile.type} className="text-center">
                <div className="font-medium">{profile.type}</div>
                <div className="text-muted-foreground">{profile.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <h3 className="font-medium">Notas adicionales:</h3>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observaciones del cliente..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        {currentView === "preparation" ? renderPreparationView() : renderQuestionView()}
      </DialogContent>
    </Dialog>
  );
}
