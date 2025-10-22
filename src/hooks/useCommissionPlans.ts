import { useState, useEffect } from 'react';
import { CommissionPlan, CommissionPlanStatus } from '@/data/commissionPlans';
import * as commissionPlansApi from '@/utils/commissionPlansApiClient';
import * as commissionPlansMapper from '@/utils/commissionPlansApiMapper';
import { CreateCommissionPlanRequest, UpdateCommissionPlanRequest } from '@/types/commissionPlansApi';
import { toast } from '@/hooks/use-toast';

export const useCommissionPlans = () => {
  const [plans, setPlans] = useState<CommissionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await commissionPlansApi.getCommissionPlans();
      const mappedPlans = response.items.map(commissionPlansMapper.mapApiCommissionPlanToUI);
      setPlans(mappedPlans);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch commission plans';
      setError(errorMessage);
      toast({
        title: "Error",
        description: "Failed to load commission plans. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (planData: Partial<CommissionPlan>): Promise<CommissionPlan | null> => {
    try {
      if (!planData.name || !planData.description || !planData.startDate || !planData.endDate || !planData.assignmentType) {
        throw new Error('Missing required fields');
      }

      const apiData: CreateCommissionPlanRequest = {
        name: planData.name,
        description: planData.description,
        start_date: commissionPlansMapper.formatDateForAPI(planData.startDate),
        end_date: commissionPlansMapper.formatDateForAPI(planData.endDate, true),
        assignment_type: planData.assignmentType,
      };

      // Add assignment_value only if it's needed and provided
      if (planData.assignmentType !== 'all_users' && planData.assignmentValue) {
        apiData.assignment_value = planData.assignmentValue;
      }

      const response = await commissionPlansApi.createCommissionPlan(apiData);
      const newPlan = commissionPlansMapper.mapApiCommissionPlanToUI(response);
      
      setPlans(prevPlans => [...prevPlans, newPlan]);
      
      toast({
        title: "Success",
        description: "Commission plan created successfully.",
      });
      
      return newPlan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create commission plan';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePlan = async (id: string, planData: Partial<CommissionPlan>): Promise<CommissionPlan | null> => {
    try {
      const apiData: UpdateCommissionPlanRequest = {};
      
      if (planData.name) apiData.name = planData.name;
      if (planData.description) apiData.description = planData.description;
      if (planData.startDate) apiData.start_date = commissionPlansMapper.formatDateForAPI(planData.startDate);
      if (planData.endDate) apiData.end_date = commissionPlansMapper.formatDateForAPI(planData.endDate, true);
      if (planData.assignmentType) apiData.assignment_type = planData.assignmentType;
      if (planData.assignmentValue) apiData.assignment_value = planData.assignmentValue;

      const response = await commissionPlansApi.updateCommissionPlan(id, apiData);
      const updatedPlan = commissionPlansMapper.mapApiCommissionPlanToUI(response);
      
      setPlans(prevPlans => 
        prevPlans.map(plan => plan.id === id ? updatedPlan : plan)
      );
      
      toast({
        title: "Success",
        description: "Commission plan updated successfully.",
      });
      
      return updatedPlan;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update commission plan';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const deletePlan = async (id: string): Promise<boolean> => {
    try {
      await commissionPlansApi.deleteCommissionPlan(id);
      
      setPlans(prevPlans => prevPlans.filter(plan => plan.id !== id));
      
      toast({
        title: "Success",
        description: "Commission plan deleted successfully.",
      });
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete commission plan';
      
      // Check if it's the specific error about associated rules
      if (errorMessage.includes('reglas asociadas')) {
        toast({
          title: "Error",
          description: "Cannot delete plan: it has associated rules. Please delete the rules first.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      return false;
    }
  };

  // Send plan to approval (draft/rejected -> ready_to_approve)
  const sendToApproval = async (id: string): Promise<boolean> => {
    try {
      const updatedPlan = await commissionPlansApi.sendPlanToApproval(id);
      const mappedPlan = commissionPlansMapper.mapApiCommissionPlanToUI(updatedPlan);
      
      setPlans(prev => prev.map(p => p.id === id ? mappedPlan : p));
      
      toast({
        title: "Success",
        description: "Plan sent for approval successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error sending plan to approval:', error);
      
      if (error.message?.includes('403')) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to perform this action",
          variant: "destructive",
        });
      } else if (error.message?.includes('409')) {
        toast({
          title: "Invalid State",
          description: "Plan must have at least one active rule and be in draft or rejected state",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to send plan for approval",
          variant: "destructive",
        });
      }
      
      return false;
    }
  };

  // Reject plan (ready_to_approve -> rejected)
  const rejectPlan = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const updatedPlan = await commissionPlansApi.rejectCommissionPlan(id, reason);
      const mappedPlan = commissionPlansMapper.mapApiCommissionPlanToUI(updatedPlan);
      
      setPlans(prev => prev.map(p => p.id === id ? mappedPlan : p));
      
      toast({
        title: "Plan Rejected",
        description: "Plan has been rejected successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error rejecting plan:', error);
      
      if (error.message?.includes('403')) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to perform this action",
          variant: "destructive",
        });
      } else if (error.message?.includes('409')) {
        toast({
          title: "Invalid State",
          description: "Plan must be in 'ready to approve' state to be rejected",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to reject plan",
          variant: "destructive",
        });
      }
      
      return false;
    }
  };

  // Publish plan (draft/ready_to_approve -> published)
  const publishPlan = async (id: string): Promise<boolean> => {
    try {
      const updatedPlan = await commissionPlansApi.publishCommissionPlan(id);
      const mappedPlan = commissionPlansMapper.mapApiCommissionPlanToUI(updatedPlan);
      
      setPlans(prev => prev.map(p => p.id === id ? mappedPlan : p));
      
      toast({
        title: "Success",
        description: "Plan published successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error publishing plan:', error);
      
      if (error.message?.includes('403')) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to perform this action",
          variant: "destructive",
        });
      } else if (error.message?.includes('409')) {
        toast({
          title: "Invalid State",
          description: "Plan must have at least one active rule and cannot be already published",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to publish plan",
          variant: "destructive",
        });
      }
      
      return false;
    }
  };

  // Inactivate plan (published -> inactive)
  const inactivatePlan = async (id: string, reason?: string): Promise<boolean> => {
    try {
      const updatedPlan = await commissionPlansApi.inactivateCommissionPlan(id, reason);
      const mappedPlan = commissionPlansMapper.mapApiCommissionPlanToUI(updatedPlan);
      
      setPlans(prev => prev.map(p => p.id === id ? mappedPlan : p));
      
      toast({
        title: "Plan Inactivated",
        description: "Plan has been inactivated successfully",
      });
      
      return true;
    } catch (error: any) {
      console.error('Error inactivating plan:', error);
      
      if (error.message?.includes('403')) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to perform this action",
          variant: "destructive",
        });
      } else if (error.message?.includes('404')) {
        toast({
          title: "Not Found",
          description: "The plan does not exist or was deleted",
          variant: "destructive",
        });
      } else if (error.message?.includes('409')) {
        toast({
          title: "Invalid State",
          description: "Plan must be in 'published' state to be inactivated",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to inactivate plan",
          variant: "destructive",
        });
      }
      
      return false;
    }
  };

  const getPlansForStatus = (status: CommissionPlanStatus) => {
    return plans.filter(plan => plan.status === status);
  };

  const getTabCount = (status: CommissionPlanStatus) => {
    return getPlansForStatus(status).length;
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    loading,
    error,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
    sendToApproval,
    rejectPlan,
    publishPlan,
    inactivatePlan,
    getPlansForStatus,
    getTabCount,
  };
};