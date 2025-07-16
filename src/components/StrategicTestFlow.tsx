
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TreePine, BarChart3, DollarSign } from 'lucide-react';

interface StrategicTestFlowProps {
  onBack: () => void;
  selectedLead?: any;
  flowType: 'multiply' | 'family' | 'preserve';
}

const STRATEGIC_CONFIG = {
  multiply: {
    title: "Test Estratégico - Inversor con Propósito",
    subtitle: "Pregunta 1 de 2",
    question: "¿Qué esperas de tu dinero en los próximos 5 años?"
  },
  family: {
    title: "Test Estratégico - Protector Familiar",
    subtitle: "Pregunta 1 de 2", 
    question: "¿Qué esperas de tu dinero en los próximos 5 años?"
  },
  preserve: {
    title: "Test Estratégico - Preservador de Patrimonio",
    subtitle: "Pregunta 1 de 2",
    question: "¿Qué esperas de tu dinero en los próximos 5 años?"
  }
};

const OPTIONS = [
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
];

export const StrategicTestFlow: React.FC<StrategicTestFlowProps> = ({ 
  onBack, 
  flowType 
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const config = STRATEGIC_CONFIG[flowType];

  return (
    <div className="min-h-[600px] bg-gray-50 p-6 m-0">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl text-center font-bold text-gray-900 mb-2">
          {config.title}
        </h1>
        
        
      </div>

      {/* Progress and Title */}
      <div className="max-w-4xl mx-auto mb-8">
        
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '50%' }}></div>
          </div>
          <p className="text-right text-sm text-gray-600">{config.subtitle}</p>
        </div>
        <h2 className="text-lg text-center font-semibold text-gray-800 mb-8">
          {config.question}
        </h2>
        
      </div>

      {/* Options */}
      <div className="max-w-2xl mx-auto space-y-4 mb-8">
        {OPTIONS.map((option) => {
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
                name="strategy"
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
          className="bg-green-400 hover:bg-green-500 text-white px-8 py-4 text-lg font-medium rounded-full"
          disabled={!selectedOption}
          onClick={() => {
            console.log('Siguiente pregunta para:', flowType, selectedOption);
          }}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
