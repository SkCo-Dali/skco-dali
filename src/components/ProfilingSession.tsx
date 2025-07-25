import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { Lead } from '@/types/crm';
import { NightmareFlow } from './NightmareFlow';
import { StrategicTestFlow } from './StrategicTestFlow';

interface ProfilingSessionProps {
  selectedLead?: Lead;
  onBack: () => void;
}

export const ProfilingSession: React.FC<ProfilingSessionProps> = ({
  selectedLead,
  onBack
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<string | null>(null);

  const answers = [
    {
      id: 'nightmare',
      emoji: '😱',
      text: '"Que no me rinda es mi pesadilla. Gasto y luego veo."'
    },
    {
      id: 'multiply',
      emoji: '🧠',
      text: '"Quiero multiplicarlo, pero con inteligencia."'
    },
    {
      id: 'family',
      emoji: '👨‍👩‍👧‍👦',
      text: '"Quiero que a mi familia no le falte nada."'
    },
    {
      id: 'preserve',
      emoji: '🛡️',
      text: '"Quiero que lo que ya hice, no se pierda."'
    }
  ];

  const profiles = [
    { letter: 'A', type: 'Inmediatista' },
    { letter: 'B', type: 'Planificador' },
    { letter: 'C', type: 'Familiar' },
    { letter: 'D', type: 'Maduro' }
  ];

  const getConfirmationMessage = () => {
    switch (selectedAnswer) {
      case 'nightmare':
        return 'Buscas disfrutar tu vida sin culpas, pero sabes que necesitas orden sin sacrificar tu estilo.';
      case 'multiply':
        return 'Tienes experiencia invirtiendo pero buscas optimizar tu estrategia con decisiones basadas en datos.';
      case 'family':
        return 'Tu prioridad es proteger a tu familia y asegurar su futuro. No estás solo en esto.';
      case 'preserve':
        return 'Has trabajado toda tu vida para llegar hasta aquí. Mereces un retiro tranquilo y sin preocupaciones.';
      default:
        return '';
    }
  };

  const getConfirmationbutton = () => {
    switch (selectedAnswer) {
      case 'nightmare':
        return '¡Sí, quiero lograrlo! →';
      case 'multiply':
        return 'Optimizar mi portafolio →';
      case 'family':
        return 'Proteger a mi familia →';
      case 'preserve':
        return 'Asegurar mi retiro →';
      default:
        return '';
    }
  };

  const handleFinalize = () => {
    if (selectedAnswer) {
      setShowConfirmation(true);
    }
  };

  const handleContinueFromConfirmation = () => {
    setCurrentFlow(selectedAnswer);
  };

  if (currentFlow === 'nightmare') {
    return (
      <NightmareFlow 
        onBack={() => setCurrentFlow(null)}
        selectedLead={selectedLead}
      />
    );
  }

  if (currentFlow === 'multiply' || currentFlow === 'family' || currentFlow === 'preserve') {
    return (
      <StrategicTestFlow 
        onBack={() => setCurrentFlow(null)}
        selectedLead={selectedLead}
        flowType={currentFlow as 'multiply' | 'family' | 'preserve'}
      />
    );
  }

  if (showConfirmation) {
    return (
      <div className="min-h-[600px] flex flex-col m-0">
        {/* Contenedor superior con fondo verde */}
        <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600 flex flex-col items-center justify-center p-6 text-white text-center relative">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowConfirmation(false)}
            className="absolute top-6 left-6 p-2 text-white hover:bg-green-600"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div className="w-32 h-32 bg-green-400 rounded-full mb-8 opacity-50"></div>
          
          <h2 className="text-3xl font-bold mb-6">
            Te entendemos perfectamente
          </h2>
          
          <p className="text-md max-w-2xl leading-relaxed">
            {getConfirmationMessage()}
          </p>
        </div>
        
        {/* Contenedor inferior con fondo blanco */}
        <div className="bg-white flex items-center justify-center p-8">
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-md font-medium rounded-full"
            onClick={handleContinueFromConfirmation}
          >
            {getConfirmationbutton()}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] bg-green-50 p-6 m-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-md font-bold text-gray-900">
              Perfilando a: {selectedLead?.name || 'Cliente'}
            </h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Advisor Guide */}
        <div className="space-y-6">
          <Card className="bg-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">💬</span>
                <h3 className="text-md font-semibold text-gray-900">Guía del asesor:</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Observa las reacciones y gestos del cliente. Toma nota de dudas o comentarios adicionales.
              </p>
              <p className="text-sm italic text-gray-600">
                Esta pregunta revela la relación emocional del cliente con el dinero. Presta atención a su lenguaje corporal.
              </p>
            </CardContent>
          </Card>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Predicción de perfiles:</h3>
            <div className="space-y-2">
              {profiles.map((profile) => (
                <div key={profile.letter} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{profile.letter}</span>
                  <span className="text-sm text-gray-600">{profile.type}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4">Notas adicionales:</h3>
            <Textarea
              placeholder="Observaciones del cliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] bg-white"
            />
          </div>
        </div>

        {/* Right Column - Question */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-8">
              Cuando piensas en tu dinero, lo primero que te viene a la mente es...
            </h2>

            <div className="space-y-4">
              {answers.map((answer) => (
                <label
                  key={answer.id}
                  className="flex items-center gap-4 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-green-300 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="answer"
                    value={answer.id}
                    checked={selectedAnswer === answer.id}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="w-5 h-5"
                  />
                  <span className="text-2xl">{answer.emoji}</span>
                  <span className="text-sm text-gray-900">{answer.text}</span>
                </label>
              ))}
            </div>
          </div>

          <Button 
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-md font-medium"
            disabled={!selectedAnswer}
            onClick={handleFinalize}
          >
            Finalizar
          </Button>
        </div>
      </div>
    </div>
  );
};
