import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, FileText, Calculator } from "lucide-react";

export default function MotorComisionesIndex() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [calculatorAnimation, setCalculatorAnimation] = useState(null);

  useEffect(() => {
    fetch('/animations/calculator_and_coin_dollar.json')
      .then(res => res.json())
      .then(data => setCalculatorAnimation(data))
      .catch(err => console.error('Error loading calculator animation:', err));
  }, []);

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const modules = [
    {
      title: "Planes de Compensación",
      description: "Administra y configura planes de comisiones para diferentes canales y tipos de asesores",
      icon: Settings,
      path: "/motor-comisiones/compensation-plans",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Catálogos",
      description: "Administra catálogos de datos utilizados para cálculos de comisiones",
      icon: Database,
      path: "/motor-comisiones/catalogs",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Info Gerencial de Comisiones",
      description: "Dashboard con métricas y análisis de comisiones para supervisores",
      icon: Calculator,
      path: "/motor-comisiones/info-gerencial",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      disabled: false,
    },
    {
      title: "Contabilidad",
      description: "Administra registros contables y financieros",
      icon: FileText,
      path: "/motor-comisiones/accounting",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      disabled: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        {calculatorAnimation ? (
          <div className="w-64 h-64">
            <Lottie animationData={calculatorAnimation} loop={true} />
          </div>
        ) : (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        )}
        <span className="text-lg text-muted-foreground">Cargando Motor de Comisiones...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Motor de Comisiones</h1>
        <p className="text-muted-foreground text-lg">
          Herramientas integrales para administrar planes de comisiones, catálogos, reglas y contabilidad
        </p>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card
            key={module.path}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              module.disabled ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
            onClick={() => !module.disabled && navigate(module.path)}
          >
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${module.bgColor}`}>
                  <module.icon className={`h-6 w-6 ${module.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {module.title}
                    {module.disabled && (
                      <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
                        Próximamente
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {!module.disabled ? "Haz clic para acceder" : "Funcionalidad en desarrollo"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
