import React from "react";
import { mockCommissions } from "@/data/commissions";
import { CommissionsTable } from "@/components/CommissionsTable";
import { CommissionsResumenTab } from "@/components/CommissionsResumenTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, FileText, Receipt } from "lucide-react";
import { CommissionsCategorySlicer, CommissionCategory } from "@/components/CommissionsCategorySlicer";
import Lottie from "lottie-react";
import { Loader2 } from "lucide-react";

export default function Comisiones() {
  const [selectedMonth, setSelectedMonth] = React.useState("2024-09");
  const [selectedYear, setSelectedYear] = React.useState("2025");
  const [selectedCategory, setSelectedCategory] = React.useState<CommissionCategory>("pensiones");
  const [loading, setLoading] = React.useState(true);
  const [moneyAnimation, setMoneyAnimation] = React.useState<any>(null);

  React.useEffect(() => {
    // Cargar la animación
    fetch("/animations/money.json")
      .then((response) => response.json())
      .then((data) => setMoneyAnimation(data))
      .catch((error) => console.error("Error loading animation:", error));

    // Simular carga de datos
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background">
        {moneyAnimation ? (
          <Lottie animationData={moneyAnimation} loop={true} style={{ width: 400, height: 400 }} />
        ) : (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        )}
        <p className="mt-4 text-lg text-muted-foreground">Cargando comisiones...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full px-4 py-4 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
        <div>
          <p className="text-[24px] font-bold mb-1 text-[#404040]">Visualiza las Comisiones por Compañia</p>
        </div>
      </div>
      {/* Category Slicer */}
      <div className="flex justify-left">
        <CommissionsCategorySlicer selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </div>

      <Tabs defaultValue="resumen" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-3 h-[37px] bg-transparent gap-0 rounded-none p-0">
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
          <TabsTrigger
            value="facturacion"
            className="data-[state=active]:bg-[#00c73d] data-[state=active]:shadow-sm data-[state=active]:text-white rounded-t-xl flex items-center gap-2 h-full mx-2"
          >
            <Receipt className="h-4 w-4" />
            Covers y facturación
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-0">
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
