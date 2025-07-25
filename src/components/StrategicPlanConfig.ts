
export const STRATEGIC_PLAN_CONFIG = {
  multiply: {
    title: "Tu Portafolio Personalizado - Inversor con Propósito",
    subtitle: "Basado en tu experiencia y expectativas",
    components: [
      {
        name: "Portafolio Agresivo",
        percentage: "40%",
        description: "Acciones internacionales y locales",
        icon: "📈"
      },
      {
        name: "Portafolio Moderado",
        percentage: "35%",
        description: "Fondos mixtos y bonos corporativos",
        icon: "⚖️"
      },
      {
        name: "Liquidez Estratégica",
        percentage: "25%",
        description: "CDTs y fondos de liquidez",
        icon: "💧"
      }
    ],
    benefits: [
      "Rentabilidad esperada: 12-15% anual",
      "Diversificación internacional",
      "Rebalanceo automático",
      "Asesoría especializada"
    ]
  },
  family: {
    title: "Tu Plan Familiar Integral",
    subtitle: "Protección y crecimiento para los tuyos",
    components: [
      {
        name: "Seguro de Vida",
        percentage: "30%",
        description: "Protección familiar completa",
        icon: "🛡️"
      },
      {
        name: "Educación Futura",
        percentage: "40%",
        description: "Fondo educativo para hijos",
        icon: "🎓"
      },
      {
        name: "Emergencias Familiares",
        percentage: "30%",
        description: "Fondo de emergencias 6 meses",
        icon: "🏥"
      }
    ],
    benefits: [
      "Familia protegida ante cualquier evento",
      "Educación asegurada para tus hijos",
      "Tranquilidad financiera",
      "Asesor familiar dedicado"
    ]
  },
  preserve: {
    title: "Tu Plan de Retiro Integral",
    subtitle: "Independencia financiera garantizada",
    components: [
      {
        name: "Renta Vitalicia",
        percentage: "50%",
        description: "Ingresos mensuales garantizados",
        icon: "💰"
      },
      {
        name: "Portafolio Conservador",
        percentage: "30%",
        description: "Inversiones de bajo riesgo",
        icon: "🏛️"
      },
      {
        name: "Liquidez Inmediata",
        percentage: "20%",
        description: "Disponibilidad para imprevistos",
        icon: "🔄"
      }
    ],
    benefits: [
      "Ingresos mensuales de por vida",
      "Preservación del patrimonio",
      "Tranquilidad total",
      "Asesor premium especializado"
    ]
  }
} as const;

export type FlowType = keyof typeof STRATEGIC_PLAN_CONFIG;
