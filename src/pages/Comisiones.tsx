import React from "react";
import { mockCommissions } from "@/data/commissions";
import { CommissionsTable } from "@/components/CommissionsTable";
import { CommissionsResumenTab } from "@/components/CommissionsResumenTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, FileText, Receipt } from "lucide-react";
import { CommissionsCategorySlicer, CommissionCategory } from "@/components/CommissionsCategorySlicer";

export default function Comisiones() {
  const [selectedMonth, setSelectedMonth] = React.useState("2024-09");
  const [selectedYear, setSelectedYear] = React.useState("2025");
  const [selectedCategory, setSelectedCategory] = React.useState<CommissionCategory>("pensiones");

  return (
    <div className="w-full px-16 py-4 space-y-6 mt-4">
      {/* Category Slicer */}
      <div className="flex justify-left">
        <CommissionsCategorySlicer selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      <Tabs defaultValue="resumen" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-3 h-14 bg-transparent border-b border-border gap-0 rounded-none p-0">
          <TabsTrigger
            value="resumen"
            className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-[#00c73d] rounded-none flex items-center gap-2 h-full"
          >
            <PieChart className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger
            value="detalle"
            className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-[#00c73d] rounded-none flex items-center gap-2 h-full"
          >
            <FileText className="h-4 w-4" />
            Detalle de comisiones
          </TabsTrigger>
          <TabsTrigger
            value="facturacion"
            className="data-[state=active]:bg-[#00c73d] data-[state=active]:text-white rounded-lg flex items-center gap-2 h-full mx-2"
          >
            <Receipt className="h-4 w-4" />
            Covers y facturación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-2">
          <CommissionsResumenTab
            commissions={mockCommissions}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            selectedCategory={selectedCategory}
          />
        </TabsContent>

        <TabsContent value="detalle" className="mt-6">
          <CommissionsTable commissions={mockCommissions} selectedCategory={selectedCategory} />
        </TabsContent>

        <TabsContent value="facturacion" className="mt-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">Próximamente</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
