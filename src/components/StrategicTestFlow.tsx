import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { STRATEGIC_PLAN_CONFIG, FlowType } from './StrategicPlanConfig';

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
  const [showPlan, setShowPlan] = useState(false);

  const questions = STRATEGIC_QUESTIONS[flowType];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const planConfig = STRATEGIC_PLAN_CONFIG[flowType];

  const handleNext = () => {
    // Guardar la respuesta actual
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOption
    }));

    if (isLastQuestion) {
      console.log('Test completado para:', flowType, answers, { [currentQuestion.id]: selectedOption });
      setShowPlan(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption('');
    }
  };

  const handleBack = () => {
    if (showPlan) {
      setShowPlan(false);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[questions[currentQuestionIndex - 1].id] || '');
    } else {
      onBack();
    }
  };

  // Vista del plan personalizado
  if (showPlan) {
    return (
      <div className="min-h-[600px] bg-white p-6 m-0">
        {/* Header */}
        <div className="flex items-center gap-4 mb-0">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {planConfig.title}
          </h1>
          <p className="text-gray-600">
            {planConfig.subtitle}
          </p>
        </div>

        {/* Plan Cards - Dividido en 3 columnas */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
          {planConfig.components.map((component, index) => (
            <div 
              key={component.name}
              className={`bg-green-50 p-6 text-center ${
                index < planConfig.components.length - 1 ? 'border-green-50 rounded-md' : ''
              }`}
            >
              <div className="text-3xl mb-4">{component.icon}</div>
              <div className="text-2xl font-bold text-green-600 mb-2">{component.percentage}</div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">{component.name}</h3>
              <p className="text-sm text-gray-600">{component.description}</p>
            </div>
          ))}
        </div>

        {/* Benefits Section - Contenedor gris */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <h3 className="text-md font-semibold text-gray-900 mb-6">Beneficios de tu plan:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {planConfig.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-md font-medium rounded-full"
            onClick={() => console.log('Plan aceptado')}
          >
            Guardar plan 🚀
          </Button>
        </div>
      </div>
    );
  }

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
              <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl">
                {option.icon}
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
