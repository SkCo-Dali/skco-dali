import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/types/crm";
import { IOpportunity } from "@/types/opportunities";
import { WidgetConfig } from "@/types/dashboard";
import { DashboardBanner } from "./DashboardBanner";
import { AchievementsSection } from "./AchievementsSection";
import { MetricCard } from "./MetricCard";
import { CommissionsChart } from "./CommissionsChart";
import { ClientDistributionChart } from "./ClientDistributionChart";
import { TodayAgenda } from "./TodayAgenda";
import { MarketDaliOpportunities } from "./MarketDaliOpportunities";
import { CareerLeaderboard } from "./CareerLeaderboard";
import { useLeadsKPICounts } from "@/hooks/useLeadsKPICounts";

interface WidgetRendererProps {
  widget: WidgetConfig;
  leads: Lead[];
  opportunities: IOpportunity[];
}

export function WidgetRenderer({ widget, leads, opportunities }: WidgetRendererProps) {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("septiembre");

  const kpiCounts = useLeadsKPICounts({
    apiFilters: {},
    duplicateFilter: "all",
  });

  const commissionsData = [
    { month: "Ene", value: 20000 },
    { month: "Feb", value: 22000 },
    { month: "Mar", value: 19000 },
    { month: "Abr", value: 25000 },
    { month: "May", value: 23000 },
    { month: "Jun", value: 24000 },
    { month: "Jul", value: 21000 },
    { month: "Ago", value: 26000 },
    { month: "Sep", value: 25000 },
  ];

  const clientDistributionData = [
    { name: "Plan de retiro y Cesantías", value: 82, color: "hsl(var(--primary))" },
    { name: "Ahorro e inversión", value: 15, color: "hsl(var(--accent))" },
    { name: "Seguros", value: 3, color: "hsl(var(--muted-foreground))" },
  ];

  switch (widget.type) {
    case "banner":
      return (
        <DashboardBanner
          title="¿Ya conoces el nuevo gestor de leads?"
          description="Optimiza tus nuevas oportunidades."
          actionLabel="Interés"
          onAction={() => navigate("/leads")}
          variant="primary"
        />
      );

    case "achievements":
      return (
        <div className="bg-[#fafafa] rounded-xl p-4 border">
          <AchievementsSection
            points={5000}
            period={selectedPeriod}
            goalMessage="¡Te quedan 3 días para lograr 10 clientes nuevos!"
            goalProgress={50}
            onViewAllAchievements={() => navigate("/gamification")}
            onPeriodChange={setSelectedPeriod}
          />
        </div>
      );

    case "metrics":
      return (
        <div className="flex flex-col gap-4 h-full">
          <MetricCard
            title="Total de Leads"
            value={kpiCounts.loading ? "..." : kpiCounts.totalLeads.toLocaleString()}
            description="Leads en la base de datos"
          />
          <MetricCard
            title="Leads Nuevos"
            value={kpiCounts.loading ? "..." : kpiCounts.newLeads.toLocaleString()}
            description="Leads en estado nuevo"
            changePercent={
              kpiCounts.loading ? undefined : Math.round((kpiCounts.newLeads / (kpiCounts.totalLeads || 1)) * 100)
            }
            changeLabel="del total"
            variant="success"
          />
          <MetricCard
            title="Contratos Creados"
            value={kpiCounts.loading ? "..." : kpiCounts.contratoCreado.toLocaleString()}
            description="Leads con estado Contrato creado"
            changePercent={
              kpiCounts.loading ? undefined : Math.round((kpiCounts.contratoCreado / (kpiCounts.totalLeads || 1)) * 100)
            }
            changeLabel="del total"
            variant="success"
          />
          <MetricCard
            title="Ventas Registradas"
            value={kpiCounts.loading ? "..." : kpiCounts.registroVenta.toLocaleString()}
            description="Leads en estado Registro de Venta"
            changePercent={
              kpiCounts.loading ? undefined : Math.round((kpiCounts.registroVenta / (kpiCounts.totalLeads || 1)) * 100)
            }
            changeLabel="del total"
            variant={kpiCounts.registroVenta > 0 ? "success" : "neutral"}
          />
        </div>
      );

    case "commissions":
      return (
        <CommissionsChart
          data={commissionsData}
          totalCommissions="$25M"
          onViewDetails={() => navigate("/comisiones")}
        />
      );

    case "distribution":
      return <ClientDistributionChart data={clientDistributionData} />;

    case "agenda":
      return <TodayAgenda />;

    case "opportunities":
      return <MarketDaliOpportunities />;

    case "leaderboard":
      return <CareerLeaderboard />;

    default:
      return null;
  }
}
