import React, { useState } from "react";
import { CommissionPlan, CommissionPlanStatus, ASSIGNMENT_LABELS } from "@/data/commissionPlans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EditCommissionPlanDialog } from "@/components/EditCommissionPlanDialog";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CommissionPlansTableProps {
  plans: CommissionPlan[];
  status: CommissionPlanStatus;
  onUpdatePlan: (id: string, planData: Partial<CommissionPlan>) => Promise<CommissionPlan | null>;
  onDeletePlan: (id: string) => Promise<boolean>;
  onSendToApproval?: (id: string) => Promise<boolean>;
  onRejectPlan?: (id: string, reason?: string) => Promise<boolean>;
  onPublishPlan?: (id: string) => Promise<boolean>;
  onInactivatePlan?: (id: string, reason?: string) => Promise<boolean>;
}

export function CommissionPlansTable({ plans, status, onUpdatePlan, onDeletePlan, onSendToApproval, onRejectPlan, onPublishPlan, onInactivatePlan }: CommissionPlansTableProps) {
  const [selectedPlan, setSelectedPlan] = useState<CommissionPlan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<CommissionPlan | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleEdit = (plan: CommissionPlan) => {
    setSelectedPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (plan: CommissionPlan) => {
    setPlanToDelete(plan);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (planToDelete) {
      const success = await onDeletePlan(planToDelete.id);
      if (success) {
        setIsDeleteDialogOpen(false);
        setPlanToDelete(null);
      }
    }
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
                      <DropdownMenuItem 
                        onClick={() => handleDelete(plan)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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
          onUpdatePlan={onUpdatePlan}
          onSendToApproval={onSendToApproval}
          onRejectPlan={onRejectPlan}
          onPublishPlan={onPublishPlan}
          onInactivatePlan={onInactivatePlan}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Commission Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone.
              {planToDelete && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Note: If this plan has associated rules, you must delete those first.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}