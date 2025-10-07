import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, FileText, Calculator } from "lucide-react";

export default function MotorComisionesIndex() {
  const navigate = useNavigate();

  const modules = [
    {
      title: "Compensation Plans",
      description: "Manage and configure commission plans for different channels and advisor types",
      icon: Settings,
      path: "/motor-comisiones/compensation-plans",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Catalogs",
      description: "Manage data catalogs used for commission calculations",
      icon: Database,
      path: "/motor-comisiones/catalogs",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rules",
      description: "Configure formulas and conditions for commission calculations",
      icon: Calculator,
      path: "/motor-comisiones/rules",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      disabled: true,
    },
    {
      title: "Accounting",
      description: "Manage accounting and financial records",
      icon: FileText,
      path: "/motor-comisiones/accounting",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      disabled: true,
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Commission Engine</h1>
        <p className="text-muted-foreground text-lg">
          Comprehensive tools for managing commission plans, catalogs, rules, and accounting
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
                        Coming soon
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
                {!module.disabled ? "Click to access" : "Feature under development"}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
