import React from "react";
import { mockCommissions } from "@/data/commissions";
import { CommissionsTable } from "@/components/CommissionsTable";
import { CommissionsResumenTab } from "@/components/CommissionsResumenTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, FileText, Receipt } from "lucide-react";

export default function Comisiones() {
  const [selectedMonth, setSelectedMonth] = React.useState("2024-09");
  const [selectedYear, setSelectedYear] = React.useState("2025");

  return (
    <div className="w-full px-16 py-4 space-y-6">
      <Tabs defaultValue="resumen" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50">
          <TabsTrigger
            value="resumen"
            className="data-[state=active]:bg-[#00c73d] data-[state=active]:text-white flex items-center gap-2"
          >
            <PieChart className="h-4 w-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger
            value="detalle"
            className="data-[state=active]:bg-[#00c73d] data-[state=active]:text-white flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Detalle de comisiones
          </TabsTrigger>
          <TabsTrigger
            value="facturacion"
            className="data-[state=active]:bg-[#00c73d] data-[state=active]:text-white flex items-center gap-2"
          >
            <Receipt className="h-4 w-4" />
            Facturación y Covers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-2">
          <CommissionsResumenTab
            commissions={mockCommissions}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </TabsContent>

        <TabsContent value="detalle" className="mt-6">
          <CommissionsTable commissions={mockCommissions} />
        </TabsContent>

        <TabsContent value="facturacion" className="mt-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">Próximamente</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
