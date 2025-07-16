
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Luggage, FileText, Bed, ShoppingBag, Target, Calendar, DollarSign } from 'lucide-react';

interface NightmareFlowProps {
  onBack: () => void;
  selectedLead?: any;
}

const NIGHTMARE_QUESTIONS = [
  {
    id: 1,
    title: "¿Qué te haría feliz lograr en 6 meses?",
    options: [
      {
        id: 'travel',
        icon: Luggage,
        title: "Irme de viaje",
        description: "Juntar para esas vacaciones que tanto mereces",
        color: "bg-pink-100 text-pink-600"
      },
      {
        id: 'debt',
        icon: FileText,
        title: "Pagar una deuda",
        description: "Liberarte de esa carga financiera",
        color: "bg-orange-100 text-orange-600"
      },
      {
        id: 'emergency',
        icon: Bed,
        title: "Tener un colchón para emergencias",
        description: "Dormir tranquilo sabiendo que tienes respaldo",
        color: "bg-blue-100 text-blue-600"
      },
      {
        id: 'shopping',
        icon: ShoppingBag,
        title: "Comprar eso que siempre pospongo",
        description: "Darte esos gustos sin afectar tus finanzas",
        color: "bg-purple-100 text-purple-600"
      }
    ],
    buttonText: "Siguiente"
  },
  {
    id: 2,
    title: "¿Cuánto dinero necesitas para lograr esto?",
    options: [
      {
        id: '1000',
        icon: DollarSign,
        title: "$1,000 - $5,000",
        description: "Para metas pequeñas y alcanzables",
        color: "bg-green-100 text-green-600"
      },
      {
        id: '5000',
        icon: DollarSign,
        title: "$5,000 - $15,000",
        description: "Para proyectos medianos",
        color: "bg-blue-100 text-blue-600"
      },
      {
        id: '15000',
        icon: DollarSign,
        title: "$15,000 - $50,000",
        description: "Para metas más ambiciosas",
        color: "bg-purple-100 text-purple-600"
      },
      {
        id: '50000',
        icon: DollarSign,
        title: "Más de $50,000",
        description: "Para grandes proyectos",
        color: "bg-orange-100 text-orange-600"
      }
    ],
    buttonText: "Crear mi fondo para esto →"
  }
];

export const NightmareFlow: React.FC<NightmareFlowProps> = ({ onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');

  const currentQuestion = NIGHTMARE_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === NIGHTMARE_QUESTIONS.length - 1;

  const handleNext = () => {
    // Guardar la respuesta actual
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOption
    }));

    if (isLastQuestion) {
      console.log('Crear fondo para:', answers, { [currentQuestion.id]: selectedOption });
      // Aquí iría la lógica final
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption('');
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[NIGHTMARE_QUESTIONS[currentQuestionIndex - 1].id] || '');
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-[600px] bg-gray-50 p-6 m-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {currentQuestion.title}
        </h1>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
        {currentQuestion.options.map((option) => {
          const Icon = option.icon;
          return (
            <label
              key={option.id}
              className={`relative p-6 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedOption === option.id 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option.id}
                checked={selectedOption === option.id}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <div className={`w-16 h-16 ${option.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {option.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Button */}
      <div className="text-center">
        <Button 
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-medium rounded-full"
          disabled={!selectedOption}
          onClick={handleNext}
        >
          {currentQuestion.buttonText}
        </Button>
      </div>
    </div>
  );
};
