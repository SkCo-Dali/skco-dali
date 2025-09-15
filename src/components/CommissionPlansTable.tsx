import React, { useState } from "react";
import { CommissionPlan, CommissionPlanStatus, ASSIGNMENT_LABELS } from "@/data/commissionPlans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditCommissionPlanDialog } from "@/components/EditCommissionPlanDialog";
import { format } from "date-fns";

interface CommissionPlansTableProps {
  plans: CommissionPlan[];
  status: CommissionPlanStatus;
}

export function CommissionPlansTable({ plans, status }: CommissionPlansTableProps) {
  const [selectedPlan, setSelectedPlan] = useState<CommissionPlan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (plan: CommissionPlan) => {
    setSelectedPlan(plan);
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: CommissionPlanStatus) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'ready_to_approve':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'rejected':
        return 'destructive';
      case 'inactive':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  if (plans.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No commission plans found for this status.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Published On</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">
                  {plan.name}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="truncate" title={plan.description}>
                    {plan.description}
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(plan.startDate)}
                </TableCell>
                <TableCell>
                  {formatDate(plan.endDate)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {ASSIGNMENT_LABELS[plan.assignmentType]}
                    {plan.assignmentValue && ` - ${plan.assignmentValue}`}
                  </Badge>
                </TableCell>
                <TableCell>
                  {plan.publishedOn ? formatDateTime(plan.publishedOn) : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background border shadow-md">
                      <DropdownMenuItem onClick={() => handleEdit(plan)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedPlan && (
        <EditCommissionPlanDialog
          plan={selectedPlan}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}