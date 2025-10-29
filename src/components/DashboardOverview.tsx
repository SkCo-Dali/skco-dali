import React, { useMemo } from "react";
import { Lead } from "@/types/crm";
import { useAuth } from "@/contexts/AuthContext";
import mockOpportunities from "@/data/mockOpportunities.json";
import { IOpportunity } from "@/types/opportunities";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { DashboardCustomizer } from "@/components/dashboard/DashboardCustomizer";
import { WidgetRenderer } from "@/components/dashboard/WidgetRenderer";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";

interface DashboardOverviewProps {
  leads: Lead[];
  loading: boolean;
}

export function DashboardOverview({ leads, loading }: DashboardOverviewProps) {
  const { user } = useAuth();
  const opportunities = mockOpportunities as IOpportunity[];

  const {
    layout,
    isCustomizing,
    setIsCustomizing,
    updateWidget,
    reorderWidgets,
    toggleWidget,
    resetLayout,
    getEnabledWidgets,
  } = useDashboardLayout();

  // Filter leads based on user role
  const userLeads = useMemo(() => {
    if (!user) return [];
    const userRole = user.role;
    const userId = user.id;

    return userRole === "admin" || userRole === "socio" || userRole === "supervisor" || userRole === "director"
      ? leads
      : leads.filter((lead) => lead.assignedTo === userId || lead.createdBy === userId);
  }, [leads, user]);

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

  if (!user) {
    return (
      <div className="text-center py-5">
        <p className="text-muted-foreground">No se pudieron cargar los datos del dashboard</p>
      </div>
    );
  }

  const enabledWidgets = getEnabledWidgets();

  return (
    <div className="space-y-4">
      {/* Customization Controls */}
      <div className="flex justify-end">
        <DashboardCustomizer
          widgets={layout.widgets}
          onToggleWidget={toggleWidget}
          onReset={resetLayout}
          isCustomizing={isCustomizing}
          onCustomizingChange={setIsCustomizing}
        />
      </div>

      {/* Dashboard Grid */}
      <DashboardGrid
        widgets={enabledWidgets}
        onReorder={reorderWidgets}
        onUpdateWidget={updateWidget}
        isCustomizing={isCustomizing}
      >
        {(widget) => <WidgetRenderer widget={widget} leads={userLeads} opportunities={opportunities} />}
      </DashboardGrid>
    </div>
  );
}
