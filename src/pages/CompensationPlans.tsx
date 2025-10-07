import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, ArrowLeft } from "lucide-react";
import { CommissionPlansTable } from "@/components/CommissionPlansTable";
import { CreateCommissionPlanDialog } from "@/components/CreateCommissionPlanDialog";
import { CommissionPlanStatus, STATUS_LABELS } from "@/data/commissionPlans";
import { useCommissionPlans } from "@/hooks/useCommissionPlans";

export default function CompensationPlans() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CommissionPlanStatus>('published');
  
  const {
    plans,
    loading,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    getPlansForStatus,
    getTabCount,
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
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-1 tracking-tight">
                  Compensation Plans
                </h1>
                <p className="text-muted-foreground">
                  Manage and configure commission plans for different channels and advisor types
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create
            </Button>
          </div>

          {/* Tabs with commission plans */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Commission Plans</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading commission plans...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>Error loading commission plans: {error}</p>
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
                          {getTabCount(status as CommissionPlanStatus)}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.keys(STATUS_LABELS).map((status) => (
                    <TabsContent key={status} value={status} className="mt-6">
                      <CommissionPlansTable 
                        plans={getPlansForStatus(status as CommissionPlanStatus)}
                        status={status as CommissionPlanStatus}
                        onUpdatePlan={updatePlan}
                        onDeletePlan={deletePlan}
                      />
                    </TabsContent>
                  ))}
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