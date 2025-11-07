import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, ArrowLeft } from "lucide-react";
import { CommissionPlansTable } from "@/components/CommissionPlansTable";
import { CreateCommissionPlanDialog } from "@/components/CreateCommissionPlanDialog";
import { CommissionPlansSearch } from "@/components/CommissionPlansSearch";
import { CommissionPlanStatus, STATUS_LABELS } from "@/data/commissionPlans";
import { useCommissionPlans } from "@/hooks/useCommissionPlans";
import { AccessDenied } from "@/components/AccessDenied";
import { PageLoading } from "@/components/PageLoading";
import { usePageAccess } from "@/hooks/usePageAccess";

export default function CompensationPlans() {
  const { hasAccess, isLoading } = usePageAccess("motor-comisiones");

  if (isLoading) {
    return <PageLoading />;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CommissionPlanStatus>('published');
  
  const {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    sendToApproval,
    rejectPlan,
    publishPlan,
    inactivatePlan,
    getPaginatedPlansForStatus,
    getTabCount,
    getFilteredTabCount,
    currentPage,
    itemsPerPage,
    totalCounts,
    handlePageChange,
    handleItemsPerPageChange,
    searchTerm,
    setSearchTerm,
  } = useCommissionPlans();

  return (
    <div className="w-full max-w-full px-4 py-4 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-1 tracking-tight">
                  Planes de Compensación
                </h1>
                <p className="text-muted-foreground">
                  Administra y configura planes de comisiones para diferentes canales y tipos de asesores
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear
            </Button>
          </div>

          {/* Tabs with commission plans */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="text-lg">Planes de Comisiones</CardTitle>
                <div className="w-full sm:w-96">
                  <CommissionPlansSearch 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando planes de comisiones...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>Error al cargar planes de comisiones: {error}</p>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CommissionPlanStatus)}>
                  <TabsList className="grid w-full grid-cols-5">
                    {Object.entries(STATUS_LABELS).map(([status, label]) => (
                      <TabsTrigger 
                        key={status} 
                        value={status}
                        className="relative"
                      >
                        {label}
                        <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                          {searchTerm ? getFilteredTabCount(status as CommissionPlanStatus) : getTabCount(status as CommissionPlanStatus)}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.keys(STATUS_LABELS).map((status) => {
                    const statusKey = status as CommissionPlanStatus;
                    const paginatedPlans = getPaginatedPlansForStatus(statusKey);
                    const filteredCount = searchTerm ? getFilteredTabCount(statusKey) : totalCounts[statusKey] || 0;
                    const totalPages = Math.ceil(filteredCount / itemsPerPage[statusKey]);
                    
                    return (
                      <TabsContent key={status} value={status} className="mt-6">
                        <CommissionPlansTable 
                          plans={paginatedPlans}
                          status={statusKey}
                          onUpdatePlan={updatePlan}
                          onDeletePlan={deletePlan}
                          onSendToApproval={sendToApproval}
                          onRejectPlan={rejectPlan}
                          onPublishPlan={publishPlan}
                          onInactivatePlan={inactivatePlan}
                          currentPage={currentPage[statusKey]}
                          totalPages={totalPages}
                          totalCount={filteredCount}
                          itemsPerPage={itemsPerPage[statusKey]}
                          onPageChange={(page) => handlePageChange(statusKey, page)}
                          onItemsPerPageChange={(items) => handleItemsPerPageChange(statusKey, items)}
                        />
                      </TabsContent>
                    );
                  })}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateCommissionPlanDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreatePlan={createPlan}
      />
    </div>
  );
}