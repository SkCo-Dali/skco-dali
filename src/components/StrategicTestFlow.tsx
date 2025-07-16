
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TreePine, BarChart3, DollarSign, Clock, Shield, Target } from 'lucide-react';

interface StrategicTestFlowProps {
  onBack: () => void;
  selectedLead?: any;
  flowType: 'multiply' | 'family' | 'preserve';
}

const STRATEGIC_QUESTIONS = {
  multiply: [
    {
      id: 1,
      title: "Test Estratégico - Inversor con Propósito",
      question: "¿Qué esperas de tu dinero en los próximos 5 años?",
      options: [
        {
          id: 'multiply',
          icon: TrendingUp,
          text: "Multiplicarlo significativamente",
          color: "bg-blue-100 text-blue-600"
        },
        {
          id: 'stable',
          icon: TreePine,
          text: "Crecimiento estable y seguro",
          color: "bg-green-100 text-green-600"
        },
        {
          id: 'diversify',
          icon: BarChart3,
          text: "Diversificar en diferentes activos",
          color: "bg-purple-100 text-purple-600"
        },
        {
          id: 'freedom',
          icon: DollarSign,
          text: "Lograr libertad financiera",
          color: "bg-yellow-100 text-yellow-600"
        }
      ],
      buttonText: "Siguiente"
    },
    {
      id: 2,
      title: "Test Estratégico - Inversor con Propósito",
      question: "¿Cuál es tu horizonte de inversión ideal?",
      options: [
        {
          id: 'short',
          icon: Clock,
          text: "1-3 años (corto plazo)",
          color: "bg-red-100 text-red-600"
        },
        {
          id: 'medium',
          icon: Clock,
          text: "3-7 años (mediano plazo)",
          color: "bg-blue-100 text-blue-600"
        },
        {
          id: 'long',
          icon: Clock,
          text: "7-15 años (largo plazo)",
          color: "bg-green-100 text-green-600"
        },
        {
          id: 'lifetime',
          icon: Clock,
          text: "Más de 15 años (toda la vida)",
          color: "bg-purple-100 text-purple-600"
        }
      ],
      buttonText: "Finalizar Test →"
    }
  ],
  family: [
    {
      id: 1,
      title: "Test Estratégico - Protector Familiar",
      question: "¿Qué esperas de tu dinero en los próximos 5 años?",
      options: [
        {
          id: 'security',
          icon: Shield,
          text: "Seguridad para mi familia",
          color: "bg-blue-100 text-blue-600"
        },
        {
          id: 'education',
          icon: Target,
          text: "Educación de mis hijos",
          color: "bg-green-100 text-green-600"
        },
        {
          id: 'house',
          icon: DollarSign,
          text: "Comprar o mejorar vivienda",
          color: "bg-purple-100 text-purple-600"
        },
        {
          id: 'emergency',
          icon: Shield,
          text: "Fondo de emergencia familiar",
          color: "bg-yellow-100 text-yellow-600"
        }
      ],
      buttonText: "Siguiente"
    },
    {
      id: 2,
      title: "Test Estratégico - Protector Familiar",
      question: "¿Cuál es tu prioridad principal para proteger a tu familia?",
      options: [
        {
          id: 'immediate',
          icon: Shield,
          text: "Protección inmediata ante emergencias",
          color: "bg-red-100 text-red-600"
        },
        {
          id: 'future',
          icon: Target,
          text: "Asegurar el futuro a largo plazo",
          color: "bg-blue-100 text-blue-600"
        },
        {
          id: 'legacy',
          icon: DollarSign,
          text: "Crear un legado familiar",
          color: "bg-green-100 text-green-600"
        },
        {
          id: 'balance',
          icon: BarChart3,
          text: "Balance entre presente y futuro",
          color: "bg-purple-100 text-purple-600"
        }
      ],
      buttonText: "Finalizar Test →"
    }
  ],
  preserve: [
    {
      id: 1,
      title: "Test Estratégico - Preservador de Patrimonio",
      question: "¿Qué esperas de tu dinero en los próximos 5 años?",
      options: [
        {
          id: 'preserve',
          icon: Shield,
          text: "Preservar lo que ya tengo",
          color: "bg-blue-100 text-blue-600"
        },
        {
          id: 'grow',
          icon: TrendingUp,
          text: "Crecimiento conservador",
          color: "bg-green-100 text-green-600"
        },
        {
          id: 'income',
          icon: DollarSign,
          text: "Generar ingresos pasivos",
          color: "bg-purple-100 text-purple-600"
        },
        {
          id: 'retire',
          icon: TreePine,
          text: "Preparar mi retiro",
          color: "bg-yellow-100 text-yellow-600"
        }
      ],
      buttonText: "Siguiente"
    },
    {
      id: 2,
      title: "Test Estratégico - Preservador de Patrimonio",
      question: "¿Qué es más importante para ti en esta etapa?",
      options: [
        {
          id: 'stability',
          icon: Shield,
          text: "Estabilidad y seguridad total",
          color: "bg-blue-100 text-blue-600"
        },
        {
          id: 'inflation',
          icon: TrendingUp,
          text: "Protección contra la inflación",
          color: "bg-orange-100 text-orange-600"
        },
        {
          id: 'liquidity',
          icon: DollarSign,
          text: "Tener liquidez disponible",
          color: "bg-green-100 text-green-600"
        },
        {
          id: 'legacy',
          icon: Target,
          text: "Dejar herencia a mis hijos",
          color: "bg-purple-100 text-purple-600"
        }
      ],
      buttonText: "Finalizar Test →"
    }
  ]
};

export const StrategicTestFlow: React.FC<StrategicTestFlowProps> = ({ 
  onBack, 
  flowType 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');

  const questions = STRATEGIC_QUESTIONS[flowType];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleNext = () => {
    // Guardar la respuesta actual
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOption
    }));

    if (isLastQuestion) {
      console.log('Test completado para:', flowType, answers, { [currentQuestion.id]: selectedOption });
      // Aquí iría la lógica final
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption('');
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[questions[currentQuestionIndex - 1].id] || '');
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
        <h1 className="text-2xl text-center font-bold text-gray-900 mb-2">
          {currentQuestion.title}
        </h1>
      </div>

      {/* Progress and Title */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-gray-600">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </p>
        </div>
        <h2 className="text-lg text-center font-semibold text-gray-800 mb-8">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Options */}
      <div className="max-w-2xl mx-auto space-y-4 mb-8">
        {currentQuestion.options.map((option) => {
          const Icon = option.icon;
          return (
            <label
              key={option.id}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
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
                className="w-4 h-4"
              />
              <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-md text-gray-900">{option.text}</span>
            </label>
          );
        })}
      </div>

      {/* Button */}
      <div className="text-center">
        <Button 
          className="bg-green-400 h-10 hover:bg-green-500 text-white px-8 py-4 text-md font-medium rounded-full"
          disabled={!selectedOption}
          onClick={handleNext}
        >
          {currentQuestion.buttonText}
        </Button>
      </div>
    </div>
  );
};
