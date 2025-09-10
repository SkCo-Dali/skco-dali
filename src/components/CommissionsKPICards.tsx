import React from "react";
import { Commission } from "@/data/commissions";
import { KPICard } from "@/components/KPICard";
import { DollarSign, TrendingUp, Calendar, Target } from "lucide-react";

interface CommissionsKPICardsProps {
  commissions: Commission[];
}

export function CommissionsKPICards({ commissions }: CommissionsKPICardsProps) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  // Calcular total del mes actual
  const currentMonthCommissions = commissions.filter(
    c => c.month === currentMonth && c.year === currentYear
  );
  const totalCurrentMonth = currentMonthCommissions.reduce((sum, c) => sum + c.commissionValue, 0);
  
  // Calcular total acumulado del año
  const currentYearCommissions = commissions.filter(c => c.year === currentYear);
  const totalCurrentYear = currentYearCommissions.reduce((sum, c) => sum + c.commissionValue, 0);
  
  // Calcular promedio mensual
  const monthsWithCommissions = new Set(
    currentYearCommissions.map(c => c.month)
  ).size;
  const averageMonthly = monthsWithCommissions > 0 ? totalCurrentYear / monthsWithCommissions : 0;
  
  // Calcular crecimiento vs mes anterior
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const previousMonthCommissions = commissions.filter(
    c => c.month === previousMonth && c.year === previousYear
  );
  const totalPreviousMonth = previousMonthCommissions.reduce((sum, c) => sum + c.commissionValue, 0);
  
  const growthPercentage = totalPreviousMonth > 0 
    ? ((totalCurrentMonth - totalPreviousMonth) / totalPreviousMonth * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Total Mes Actual"
        value={`$${totalCurrentMonth.toLocaleString()}`}
        icon={DollarSign}
        description={`Comisiones de ${new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`}
        change={growthPercentage !== 0 ? `${growthPercentage > 0 ? '+' : ''}${growthPercentage.toFixed(1)}%` : undefined}
        changeType={growthPercentage > 0 ? 'positive' : growthPercentage < 0 ? 'negative' : 'neutral'}
      />
      
      <KPICard
        title="Acumulado Año"
        value={`$${totalCurrentYear.toLocaleString()}`}
        icon={TrendingUp}
        description={`Total ${currentYear}`}
        change={`${currentYearCommissions.length} comisiones`}
        changeType="positive"
      />
      
      <KPICard
        title="Promedio Mensual"
        value={`$${Math.round(averageMonthly).toLocaleString()}`}
        icon={Target}
        description="Promedio por mes activo"
        change={`${monthsWithCommissions} meses activos`}
        changeType="neutral"
      />
      
      <KPICard
        title="Comisiones Activas"
        value={currentMonthCommissions.length.toString()}
        icon={Calendar}
        description="Comisiones este mes"
        change={`${currentYearCommissions.length} en el año`}
        changeType="positive"
      />
    </div>
  );
}