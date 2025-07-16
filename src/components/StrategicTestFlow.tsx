
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
      id: "expectations_5_years",
      title: "Test Estratégico - Inversor con Propósito",
      question: "¿Qué esperas de tu dinero en los próximos 5 años?",
      options: [
        {
          id: 'multiplicar',
          icon: "📈",
          text: "Multiplicarlo significativamente"
         
        },
        {
          id: 'crecer_estable',
          icon: "🌱",
          text: "Crecimiento estable y seguro"
         
        },
        {
          id: 'diversificar',
          icon: "📊",
          text: "Diversificar en diferentes activos"
          
        },
        {
          id: 'libertad_financiera',
          icon: "🗽",
          text: "Lograr libertad financiera"
          
        }
      ],
      buttonText: "Siguiente"
    },
    {
      id: "investment_experience",
      title: "Test Estratégico - Inversor con Propósito",
      question: "¿Tienes experiencia invirtiendo?",
      options: [
        {
          id: 'experto',
          icon: "🎯",
          text: "Sí, manejo varios instrumentos"
          
        },
        {
          id: 'intermedio',
          icon: "📚",
          text: "Algo, pero quiero aprender más"
         
        },
        {
          id: 'principiante',
          icon: "🌱",
          text: "Muy poca, necesito orientación"
          
        },
        {
          id: 'ninguna',
          icon: "🚀",
          text: "No, pero estoy listo para empezar"
          
        }
      ],
      buttonText: "Finalizar Test →"
    }
  ],
  family: [
    {
      id: "who_to_protect",
      title: "Análisis Familiar - Cuidador Visionario",
      question: "¿A quién quieres proteger?",
      options: [
        {
          id: 'pareja_hijos',
          icon: "👨‍👩‍👧‍👦",
          text: "Mi pareja e hijos"
          
        },
        {
          id: 'hijos',
          icon: "👶",
          text: "Mis hijos"
         
        },
        {
          id: 'padres',
          icon: "👴👵",
          text: "Mis padres"
         
        },
        {
          id: 'familia_extendida',
          icon: "🏠",
          text: "Toda mi familia"
         
        }
      ],
      buttonText: "Siguiente"
    },
    {
      id: "protection_priority",
      title: "Análisis Familiar - Cuidador Visionario",
      question: "¿Cuál es tu mayor preocupación familiar?",
      options: [
        {
          id: 'educacion',
          icon: "🎓",
          text: "Educación de los hijos"
          
        },
        {
          id: 'salud',
          icon: "🏥",
          text: "Gastos médicos inesperados"
         
        },
        {
          id: 'vivienda',
          icon: "🏡",
          text: "Asegurar la vivienda familiar"
          
        },
        {
          id: 'futuro',
          icon: "🔮",
          text: "El futuro en general"
        
        }
      ],
      buttonText: "Finalizar Test →"
    }
  ],
  preserve: [
    {
      id: "monthly_need",
      title: "Análisis de Situación - Constructor de Legado",
      question: "¿Cuánto necesitas para vivir tranquilo al mes?",
      options: [
        {
          id: '2_3_millones',
          icon: "💰",
          text: "Entre $2-3 millones"
        
        },
        {
          id: '3_5_millones',
          icon: "💎",
          text: "Entre $3-5 millones"
          
        },
        {
          id: '5_7_millones',
          icon: "🏆",
          text: "Entre $5-7 millones"
        
        },
        {
          id: 'mas_7_millones',
          icon: "👑",
          text: "Más de $7 millones"
      
        }
      ],
      buttonText: "Siguiente"
    },
    {
      id: "pension_status",
      title: "Test Estratégico - Preservador de Patrimonio",
      question: "¿Tienes pensión?",
      options: [
        {
          id: 'si_completa',
          icon: "✅",
          text: "Sí, pensión completa"
        
        },
        {
          id: 'si_parcial',
          icon: "⚠️",
          text: "Sí, pero insuficiente"
         
        },
        {
          id: 'no_pero_cotizo',
          icon: "🔄",
          text: "No, pero sigo cotizando"
        
        },
        {
          id: 'no_nada',
          icon: "❌",
          text: "No tengo ni cotizo"
         
        }
        ],
      buttonText: "Siguiente"
    },
        {
      id: "properties",
      title: "Análisis de Situación - Constructor de Legado",
      question: "¿Tienes propiedades?",
      options: [
        {
          id: 'casa_propia',
          icon: "🏠",
          text: "Mi casa propia (paga)"
         
        },
        {
          id: 'casa_hipoteca',
          icon: "🏚️",
          text: "Mi casa (con hipoteca)"
        
        },
        {
          id: 'varias_propiedades',
          icon: "🏢",
          text: "Varias propiedades"
   
        },
        {
          id: 'no_propiedades',
          icon: "📄",
          text: "No tengo propiedades"

        }
      ],
      buttonText: "Siguiente"
    },
    {
      id: "family_support",
      title: "Análisis de Situación - Constructor de Legado",
      question: "¿Tienes apoyo familiar?",
      options: [
        {
          id: 'si_total',
          icon: "❤️",
          text: "Sí, familia unida y estable"
   
        },
        {
          id: 'si_parcial',
          icon: "🤝",
          text: "Parcialmente"
       
        },
        {
          id: 'no_mucho',
          icon: "😔",
          text: "Muy poco"
   
        },
        {
          id: 'independiente',
          icon: "💪",
          text: "Prefiero ser independiente"
 
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
              <div className= "w-12 h-12 rounded-lg flex items-center justify-center"
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
