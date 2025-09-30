import React, { useMemo } from "react";
import { Lead } from "@/types/crm";
import { KPICard } from "@/components/KPICard";
import { TodayFollowUpsList } from "@/components/dashboard/TodayFollowUpsList";
import { TodayTasksList } from "@/components/dashboard/TodayTasksList";
import { TodayOpportunitiesList } from "@/components/dashboard/TodayOpportunitiesList";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/hooks/useTasks";
import { Users, TrendingUp, Calendar, CheckCircle, DollarSign, UserCheck } from "lucide-react";
import mockOpportunities from "@/data/mockOpportunities.json";
import { IOpportunity } from "@/types/opportunities";

interface DashboardOverviewProps {
  leads: Lead[];
  loading: boolean;
}

export function DashboardOverview({ leads, loading }: DashboardOverviewProps) {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const opportunities = mockOpportunities as IOpportunity[];

  // Filter leads based on user role
  const userLeads = useMemo(() => {
    if (!user) return [];
    const userRole = user.role;
    const userId = user.id;
    
    return userRole === 'admin' || userRole === 'socio' || userRole === 'supervisor' || userRole === 'director'
      ? leads // Admins and managers see all leads
      : leads.filter(lead => lead.assignedTo === userId || lead.createdBy === userId);
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
    
    const newAssignedLeads = userLeads.filter(lead => {
      const createdDate = new Date(lead.createdAt);
      return createdDate >= sevenDaysAgo && (lead.assignedTo === userId || userRole === 'admin');
    }).length;

    // Upcoming follow-ups (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingFollowUps = userLeads.filter(lead => {
      if (!lead.nextFollowUp) return false;
      const followUpDate = new Date(lead.nextFollowUp);
      const today = new Date();
      return followUpDate >= today && followUpDate <= nextWeek;
    }).length;

    // Leads in active stages (not Won or Lost)
    const activeLeads = userLeads.filter(lead => 
      !['Won', 'Lost', 'Registro de Venta (fondeado)'].includes(lead.stage)
    ).length;

    // Converted leads (Won or in final stage)
    const convertedLeads = userLeads.filter(lead => 
      lead.stage === 'Registro de Venta (fondeado)' || lead.status === 'Won'
    ).length;

    // High priority leads
    const highPriorityLeads = userLeads.filter(lead => 
      lead.priority === 'High' || lead.priority === 'high' || lead.priority === 'urgent'
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
      conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0'
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

  const isManagerRole = ['admin', 'manager', 'supervisor', 'director'].includes(user.role);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          Bienvenido, {user.name}
        </h2>
        <p className="text-muted-foreground">
          Resumen de tu actividad {isManagerRole ? 'y del equipo' : 'comercial'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={isManagerRole ? "Total Leads del Equipo" : "Mis Leads"}
          value={kpis.totalLeads.toLocaleString()}
          icon={Users}
          description={isManagerRole ? "Leads en la base de datos" : "Leads asignados a ti"}
        />
        
        <KPICard
          title="Nuevos Asignados"
          value={kpis.newAssignedLeads.toString()}
          icon={TrendingUp}
          change="Últimos 7 días"
          changeType={kpis.newAssignedLeads > 0 ? 'positive' : 'neutral'}
          description="Leads recientemente asignados"
        />
        
        <KPICard
          title="Próximos Seguimientos"
          value={kpis.upcomingFollowUps.toString()}
          icon={Calendar}
          change="Próximos 7 días"
          changeType={kpis.upcomingFollowUps > 0 ? 'positive' : 'neutral'}
          description="Seguimientos programados"
        />
        
        <KPICard
          title="Leads Activos"
          value={kpis.activeLeads.toString()}
          icon={UserCheck}
          change={`${kpis.totalLeads > 0 ? ((kpis.activeLeads / kpis.totalLeads) * 100).toFixed(1) : '0'}% del total`}
          changeType="neutral"
          description="En proceso de gestión"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <KPICard
          title="Leads Convertidos"
          value={kpis.convertedLeads.toString()}
          icon={CheckCircle}
          change={`${kpis.conversionRate}% conversión`}
          changeType={kpis.convertedLeads > 0 ? 'positive' : 'neutral'}
          description="Ventas cerradas exitosamente"
        />
        
        <KPICard
          title="Alta Prioridad"
          value={kpis.highPriorityLeads.toString()}
          icon={TrendingUp}
          change={`${kpis.totalLeads > 0 ? ((kpis.highPriorityLeads / kpis.totalLeads) * 100).toFixed(1) : '0'}% del total`}
          changeType={kpis.highPriorityLeads > 0 ? 'positive' : 'neutral'}
          description="Leads de alta prioridad"
        />
        
        <KPICard
          title="Valor Total Pipeline"
          value={`$${kpis.totalValue.toLocaleString()}`}
          icon={DollarSign}
          description="Valor potencial de leads"
        />
      </div>

      {/* Today's Activities Section */}
      <div className="mt-4">
        <h3 className="text-xl font-semibold mb-4">Actividades de Hoy</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TodayFollowUpsList leads={userLeads} />
          <TodayTasksList tasks={tasks} />
          <TodayOpportunitiesList opportunities={opportunities} />
        </div>
      </div>
    </div>
  );
}