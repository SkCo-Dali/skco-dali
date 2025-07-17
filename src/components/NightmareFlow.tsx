import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Luggage, FileText, Bed, ShoppingBag, Target, Calendar, DollarSign, RefreshCw, CreditCard, Gift, Check } from 'lucide-react';

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
    buttonText: "Crear mi fondo para esto →"
  }
];

// Configuración personalizable para la vista de creación de fondo
const FUND_CREATION_CONFIG = {
  travel: {
    title: "¡Perfecto! Creemos tu fondo",
    subtitle: "Solo tú decides cómo y cuándo. Nosotros te ayudamos a crecerlo.",
    fundNamePlaceholder: "Mi fondo de viaje",
    defaultAmount: 50000,
    projectionText: "Proyección a 6 meses:",
    projectionAmount: "$300,000",
    buttonText: "Ver mi simulador personalizado 📱"
  },
  debt: {
    title: "¡Perfecto! Creemos tu fondo",
    subtitle: "Solo tú decides cómo y cuándo. Nosotros te ayudamos a crecerlo.",
    fundNamePlaceholder: "Mi fondo para pagar deudas",
    defaultAmount: 50000,
    projectionText: "Proyección a 6 meses:",
    projectionAmount: "$300,000",
    buttonText: "Ver mi simulador personalizado 📱"
  },
  emergency: {
    title: "¡Perfecto! Creemos tu fondo",
    subtitle: "Solo tú decides cómo y cuándo. Nosotros te ayudamos a crecerlo.",
    fundNamePlaceholder: "Mi fondo de emergencias",
    defaultAmount: 50000,
    projectionText: "Proyección a 6 meses:",
    projectionAmount: "$300,000",
    buttonText: "Ver mi simulador personalizado 📱"
  },
  shopping: {
    title: "¡Perfecto! Creemos tu fondo",
    subtitle: "Solo tú decides cómo y cuándo. Nosotros te ayudamos a crecerlo.",
    fundNamePlaceholder: "Mi fondo de compras",
    defaultAmount: 50000,
    projectionText: "Proyección a 6 meses:",
    projectionAmount: "$300,000",
    buttonText: "Ver mi simulador personalizado 📱"
  }
};

export const NightmareFlow: React.FC<NightmareFlowProps> = ({ onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showFundCreation, setShowFundCreation] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [fundName, setFundName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState(50000);
  const projectedAmount = monthlyAmount * 6

  const currentQuestion = NIGHTMARE_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === NIGHTMARE_QUESTIONS.length - 1;
  const fundConfig = selectedOption ? FUND_CREATION_CONFIG[selectedOption as keyof typeof FUND_CREATION_CONFIG] : null;

  const handleNext = () => {
    // Guardar la respuesta actual
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: selectedOption
    }));

    if (isLastQuestion) {
      // Configurar valores por defecto para la creación del fondo
      if (fundConfig) {
        setFundName(fundConfig.fundNamePlaceholder);
        setMonthlyAmount(fundConfig.defaultAmount);
      }
      setShowFundCreation(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption('');
    }
  };

  const handleBack = () => {
    if (showPlan) {
      setShowPlan(false);
    } else if (showFundCreation) {
      setShowFundCreation(false);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[NIGHTMARE_QUESTIONS[currentQuestionIndex - 1].id] || '');
    } else {
      onBack();
    }
  };

  const handleCreateFund = () => {
    console.log('Crear fondo:', {
      type: selectedOption,
      name: fundName,
      monthlyAmount: monthlyAmount,
      answers: { ...answers, [currentQuestion.id]: selectedOption }
    });
    setShowPlan(true);
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
          <h1 className="text-lg font-bold text-gray-900 mb-2">
            Tu Plan Sin Complicaciones
          </h1>
          <p className="text-gray-600">
            Automatizado y eficiente
          </p>
        </div>

        {/* Plan Cards */}
        <div className="bg-green-50 rounded-lg p-6 mb-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ahorro Automático */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">60%</div>
              <h3 className="font-semibold text-gray-900 mb-2">Ahorro Automático</h3>
              <p className="text-sm text-gray-600">Inversión mensual automática</p>
            </div>

            {/* Fondo de Emergencias */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">25%</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fondo de Emergencias</h3>
              <p className="text-sm text-gray-600">3 meses de gastos cubiertos</p>
            </div>

            {/* Fondo para Gustos */}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">15%</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fondo para Gustos</h3>
              <p className="text-sm text-gray-600">Para tus placeres sin culpa</p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Beneficios de tu plan:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Todo automático, sin esfuerzo</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Metas alcanzables mes a mes</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Disfruta sin culpa</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-gray-700">Asesoría cuando la necesites</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-medium rounded-full"
            onClick={() => console.log('Plan aceptado')}
          >
            Comenzar mi plan 🚀
          </Button>
        </div>
      </div>
    );
  }

  // Vista de creación de fondo
  if (showFundCreation && fundConfig) {
    return (
      <div className="min-h-[600px] bg-gray-50 p-2 m-0">
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

        {/* Success Icon */}
        <div className="text-center mb-8 mt-0">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="h-10 w-10 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {fundConfig.title}
          </h1>
          <p className="text-gray-600">
            {fundConfig.subtitle}
          </p>
        </div>

        {/* Form */}
        <div className="max-w-md mx-auto space-y-6">
          {/* Fund Name */}
          <div>
            <label htmlFor="fundName" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de tu fondo
            </label>
            <Input
              id="fundName"
              value={fundName}
              onChange={(e) => setFundName(e.target.value)}
              placeholder={fundConfig.fundNamePlaceholder}
              className="w-full"
            />
          </div>

          {/* Monthly Amount */}
          <div>
            <label htmlFor="monthlyAmount" className="block text-sm font-medium text-gray-700 mb-2">
              ¿Cuánto quieres ahorrar mensualmente?
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
              <Input
                id="monthlyAmount"
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                className="!pl-10 text-sm py-3 border-2 border-gray-200 focus:border-green-500 rounded-lg"
              />
            </div>
          </div>

          {/* Projection Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <p className="text-sm font-medium text-green-800 mb-1">
                  {fundConfig.projectionText}
                </p>
                <p className="text-lg font-bold text-green-600">
                  ${projectedAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Create Button */}
          <Button 
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 text-md font-medium rounded-full"
            onClick={handleCreateFund}
          >
            {fundConfig.buttonText}
          </Button>
        </div>
      </div>
    );
  }

  // Vista de preguntas (código existente)
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
                <h3 className="text-md font-semibold text-gray-900 mb-2">
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
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-md font-medium rounded-full"
          disabled={!selectedOption}
          onClick={handleNext}
        >
          {currentQuestion.buttonText}
        </Button>
      </div>
    </div>
  );
};
