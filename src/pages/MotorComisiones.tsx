import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { CommissionPlansTable } from "@/components/CommissionPlansTable";
import { CreateCommissionPlanDialog } from "@/components/CreateCommissionPlanDialog";
import { mockCommissionPlans, CommissionPlanStatus, STATUS_LABELS } from "@/data/commissionPlans";

export default function MotorComisiones() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CommissionPlanStatus>('published');

  const getPlansForStatus = (status: CommissionPlanStatus) => {
    return mockCommissionPlans.filter(plan => plan.status === status);
  };

  const getTabCount = (status: CommissionPlanStatus) => {
    return getPlansForStatus(status).length;
  };

  return (
    <div className="w-full max-w-full px-4 py-4 space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight">
                Compensation Plans
              </h1>
              <p className="text-muted-foreground">
                Manage and configure commission plans for different channels and advisor types
              </p>
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
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <CreateCommissionPlanDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}