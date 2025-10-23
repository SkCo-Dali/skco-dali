import React, { useMemo, useState } from "react";
import { Lead } from "@/types/crm";
import { DashboardBanner } from "@/components/dashboard/DashboardBanner";
import { AchievementsSection } from "@/components/dashboard/AchievementsSection";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CommissionsChart } from "@/components/dashboard/CommissionsChart";
import { ClientDistributionChart } from "@/components/dashboard/ClientDistributionChart";
import { TodayAgenda } from "@/components/dashboard/TodayAgenda";
import { MarketDaliOpportunities } from "@/components/dashboard/MarketDaliOpportunities";
import { CareerLeaderboard } from "@/components/dashboard/CareerLeaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import mockOpportunities from "@/data/mockOpportunities.json";
import { IOpportunity } from "@/types/opportunities";
import { useNavigate } from "react-router-dom";

interface DashboardOverviewProps {
  leads: Lead[];
  loading: boolean;
}

export function DashboardOverview({ leads, loading }: DashboardOverviewProps) {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const navigate = useNavigate();
  const opportunities = mockOpportunities as IOpportunity[];
  const [selectedPeriod, setSelectedPeriod] = useState("septiembre");

  // Filter leads based on user role
  const userLeads = useMemo(() => {
    if (!user) return [];
    const userRole = user.role;
    const userId = user.id;

    return userRole === "admin" || userRole === "socio" || userRole === "supervisor" || userRole === "director"
      ? leads // Admins and managers see all leads
      : leads.filter((lead) => lead.assignedTo === userId || lead.createdBy === userId);
  }, [leads, user]);

  const kpis = useMemo(() => {
    if (!user || loading) return null;

    const userRole = user.role;
    const userId = user.id;

    // Calculate KPIs
    const totalLeads = userLeads.length;

    // New leads assigned to user in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newAssignedLeads = userLeads.filter((lead) => {
      const createdDate = new Date(lead.createdAt);
      return createdDate >= sevenDaysAgo && (lead.assignedTo === userId || userRole === "admin");
    }).length;

    // Upcoming follow-ups (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingFollowUps = userLeads.filter((lead) => {
      if (!lead.nextFollowUp) return false;
      const followUpDate = new Date(lead.nextFollowUp);
      const today = new Date();
      return followUpDate >= today && followUpDate <= nextWeek;
    }).length;

    // Leads in active stages (not Won or Lost)
    const activeLeads = userLeads.filter(
      (lead) => !["Won", "Lost", "Registro de Venta (fondeado)"].includes(lead.stage),
    ).length;

    // Converted leads (Won or in final stage)
    const convertedLeads = userLeads.filter(
      (lead) => lead.stage === "Registro de Venta (fondeado)" || lead.status === "Won",
    ).length;

    // High priority leads
    const highPriorityLeads = userLeads.filter(
      (lead) => lead.priority === "High" || lead.priority === "high" || lead.priority === "urgent",
    ).length;

    // Total value of user's leads
    const totalValue = userLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);

    return {
      totalLeads,
      newAssignedLeads,
      upcomingFollowUps,
      activeLeads,
      convertedLeads,
      highPriorityLeads,
      totalValue,
      conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0",
    };
  }, [userLeads, user, loading]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted h-32 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!kpis || !user) {
    return (
      <div className="text-center py-5">
        <p className="text-muted-foreground">No se pudieron cargar los datos del dashboard</p>
      </div>
    );
  }

  const isManagerRole = ["admin", "manager", "supervisor", "director"].includes(user.role);

  // Mock data for charts - In production, this would come from API
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

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-3 space-y-6">
        {/* Banner */}
        <DashboardBanner
          title="¿Ya conoces el nuevo gestor de leads?"
          description="Optimiza tus nuevas oportunidades."
          actionLabel="Interés"
          onAction={() => navigate("/leads")}
          variant="primary"
        />
        <div className="bg-[#fafafa] rounded-xl pb-4 space-y-4">
          {/* Achievements Section */}
          <AchievementsSection
            points={5000}
            period={selectedPeriod}
            goalMessage="¡Te quedan 3 días para lograr 10 clientes nuevos!"
            goalProgress={50}
            onViewAllAchievements={() => navigate("/gamification")}
            onPeriodChange={setSelectedPeriod}
          />

          {/* Metrics and Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4">
            {/* Left Column - Metrics */}
            <div className="flex flex-col gap-4 h-full">
              <MetricCard title="Venta neta" value="$40M" changePercent={5} changeLabel="¡Wow!" variant="success" />
              <MetricCard
                title="Aportes de tus clientes"
                value="$25M"
                changePercent={5}
                changeLabel="¡Wow!"
                variant="success"
              />
              <MetricCard
                title="Retiros de tus clientes"
                value="$15M"
                changePercent={10}
                changeLabel="¡Vamos!"
                variant="success"
              />
              <MetricCard
                title="Tus clientes actuales totales"
                value="125"
                changePercent={-1}
                changeLabel="1 inactivo"
                variant="warning"
              />
              <div className="flex-1">
                <MetricCard title="Activos bajo administración" value="$125.000.000" />
              </div>
            </div>

            {/* Right Column - Charts */}
            <div className="flex flex-col gap-4 h-full">
              <CommissionsChart
                data={commissionsData}
                totalCommissions="$25M"
                onViewDetails={() => navigate("/comisiones")}
              />
              <ClientDistributionChart data={clientDistributionData} />
            </div>
          </div>
        </div>

        {/* Today's Activities Section */}
        <div className="bg-transparent mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-0">
            <TodayAgenda />
            <MarketDaliOpportunities />
          </div>
        </div>
      </div>

      {/* Career Leaderboard - Right Column */}
      <div className="col-span-1">
        <CareerLeaderboard />
      </div>
    </div>
  );
}
