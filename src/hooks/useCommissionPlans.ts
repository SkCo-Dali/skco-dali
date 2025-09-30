import { useState, useEffect } from 'react';
import { CommissionPlan, CommissionPlanStatus } from '@/data/commissionPlans';
import { getCommissionPlans, createCommissionPlan, updateCommissionPlan, deleteCommissionPlan } from '@/utils/commissionPlansApiClient';
import { mapApiCommissionPlanToUI, mapUICommissionPlanToAPI, formatDateForAPI } from '@/utils/commissionPlansApiMapper';
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
      
      const response = await getCommissionPlans();
      const mappedPlans = response.items.map(mapApiCommissionPlanToUI);
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
        start_date: formatDateForAPI(planData.startDate),
        end_date: formatDateForAPI(planData.endDate, true),
        assignment_type: planData.assignmentType,
      };

      // Add assignment_value only if it's needed and provided
      if (planData.assignmentType !== 'all_users' && planData.assignmentValue) {
        apiData.assignment_value = planData.assignmentValue;
      }

      const response = await createCommissionPlan(apiData);
      const newPlan = mapApiCommissionPlanToUI(response);
      
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
      if (planData.startDate) apiData.start_date = formatDateForAPI(planData.startDate);
      if (planData.endDate) apiData.end_date = formatDateForAPI(planData.endDate, true);
      if (planData.assignmentType) apiData.assignment_type = planData.assignmentType;
      if (planData.assignmentValue) apiData.assignment_value = planData.assignmentValue;

      const response = await updateCommissionPlan(id, apiData);
      const updatedPlan = mapApiCommissionPlanToUI(response);
      
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
      await deleteCommissionPlan(id);
      
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
    getPlansForStatus,
    getTabCount,
  };
};