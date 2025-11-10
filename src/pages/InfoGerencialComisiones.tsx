import React, { useState } from "react";
import { CommissionsCategorySlicer, CommissionCategory } from "@/components/CommissionsCategorySlicer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommissionsResumenTab } from "@/components/CommissionsResumenTab";
import { InfoGerencialTable } from "@/components/InfoGerencialTable";
import { mockCommissions } from "@/data/commissions";
import { PieChart, FileText } from "lucide-react";

export default function InfoGerencialComisiones() {
  const [selectedCategory, setSelectedCategory] = useState<CommissionCategory>("pensiones");
  const [selectedMonth, setSelectedMonth] = useState("septiembre");
  const [selectedYear, setSelectedYear] = useState("2025");

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Info Gerencial de Comisiones</h1>
          <p className="text-muted-foreground">
            Dashboard de métricas y análisis de comisiones para supervisores y analistas
          </p>
        </div>

        {/* Category Slicer */}
        <div className="flex items-center justify-center py-4">
          <CommissionsCategorySlicer selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resumen" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-[37px] bg-transparent gap-0 rounded-none p-0">
            <TabsTrigger
              value="resumen"
              className="data-[state=active]:bg-[#00c73d] data-[state=active]:shadow-sm data-[state=active]:text-white rounded-t-xl flex items-center gap-2 h-full mx-0"
            >
              <PieChart className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="detalle"
              className="data-[state=active]:bg-[#00c73d] data-[state=active]:shadow-sm data-[state=active]:text-white rounded-t-xl flex items-center gap-2 h-full mx-2"
            >
              <FileText className="h-4 w-4" />
              Detalle de comisiones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-0">
            <CommissionsResumenTab
              commissions={mockCommissions}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              selectedCategory={selectedCategory}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
            />
          </TabsContent>

          <TabsContent value="detalle" className="mt-0">
            <InfoGerencialTable commissions={mockCommissions} selectedCategory={selectedCategory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
