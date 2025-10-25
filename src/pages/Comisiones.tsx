import React from "react";
import { mockCommissions } from "@/data/commissions";
import { CommissionsTable } from "@/components/CommissionsTable";
import { CommissionsResumenTab } from "@/components/CommissionsResumenTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, FileText, Receipt } from "lucide-react";
import { CommissionsCategorySlicer, CommissionCategory } from "@/components/CommissionsCategorySlicer";
import { AccessDenied } from "@/components/AccessDenied";
import { usePageAccess } from "@/hooks/usePageAccess";

export default function Comisiones() {
  const { hasAccess } = usePageAccess("comisiones");

  if (!hasAccess) {
    return <AccessDenied />;
  }
  const [selectedMonth, setSelectedMonth] = React.useState("2024-09");
  const [selectedYear, setSelectedYear] = React.useState("2025");
  const [selectedCategory, setSelectedCategory] = React.useState<CommissionCategory>("pensiones");

  return (
    <div className="w-full max-w-full px-4 py-4 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
        <div>
          <h3 className="text-[24px] md:text-2xl lg:text-3xl font-bold mb-1 text-[#404040]">
            Visualiza las Comisiones por Compañia
          </h3>
        </div>
      </div>
      {/* Category Slicer */}
      <div className="flex justify-left">
        <CommissionsCategorySlicer selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      <Tabs defaultValue="resumen" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-3 h-[37px] bg-transparent border-b border-border gap-0 rounded-none p-0">
          <TabsTrigger
            value="resumen"
            className="data-[state=active]:bg-[#00c73d] data-[state=active]:text-white rounded-t-xl flex items-center gap-2 h-full mx-2"
          >
            <PieChart className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger
            value="detalle"
            className="data-[state=active]:bg-[#00c73d] data-[state=active]:text-white rounded-t-xl flex items-center gap-2 h-full mx-2"
          >
            <FileText className="h-4 w-4" />
            Detalle de comisiones
          </TabsTrigger>
          <TabsTrigger
            value="facturacion"
            className="data-[state=active]:bg-[#00c73d] data-[state=active]:text-white rounded-t-xl flex items-center gap-2 h-full mx-2"
          >
            <Receipt className="h-4 w-4" />
            Covers y facturación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="border rounded-b-md mt-0 mb-2 pb-2 px-2">
          <CommissionsResumenTab
            commissions={mockCommissions}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            selectedCategory={selectedCategory}
          />
        </TabsContent>

        <TabsContent value="detalle" className="mt-0">
          <CommissionsTable commissions={mockCommissions} selectedCategory={selectedCategory} />
        </TabsContent>

        <TabsContent value="facturacion" className="mt-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">Próximamente</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
