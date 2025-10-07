import { useState, useEffect } from 'react';
import {
  getConditionRules,
  createConditionRule,
  updateConditionRule,
  deleteConditionRule,
} from '@/utils/conditionRulesApiClient';
import {
  ApiConditionRule,
  CreateConditionRuleRequest,
  UpdateConditionRuleRequest,
  ConditionRulesQueryParams,
} from '@/types/conditionRulesApi';

interface UseConditionRulesReturn {
  conditions: ApiConditionRule[];
  loading: boolean;
  error: string | null;
  fetchConditions: (params?: ConditionRulesQueryParams) => Promise<void>;
  createCondition: (conditionData: CreateConditionRuleRequest) => Promise<ApiConditionRule | null>;
  updateCondition: (conditionId: string, conditionData: UpdateConditionRuleRequest) => Promise<ApiConditionRule | null>;
  deleteCondition: (conditionId: string) => Promise<boolean>;
  totalConditions: number;
  currentPage: number;
  pageSize: number;
}

/**
 * Custom hook to manage condition rules for a commission rule
 */
export const useConditionRules = (ruleId: string): UseConditionRulesReturn => {
  const [conditions, setConditions] = useState<ApiConditionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalConditions, setTotalConditions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  /**
   * Fetch conditions for the rule
   */
  const fetchConditions = async (params?: ConditionRulesQueryParams) => {
    if (!ruleId) {
      console.warn('useConditionRules: No ruleId provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getConditionRules(ruleId, params);
      setConditions(response.items);
      setTotalConditions(response.total);
      setCurrentPage(response.page);
      setPageSize(response.page_size);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conditions';
      setError(errorMessage);
      console.error('Error fetching conditions:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new condition
   */
  const createCondition = async (
    conditionData: CreateConditionRuleRequest
  ): Promise<ApiConditionRule | null> => {
    if (!ruleId) {
      console.error('useConditionRules: No ruleId provided for creating condition');
      return null;
    }

    setError(null);

    try {
      const newCondition = await createConditionRule(ruleId, conditionData);
      
      // Add the new condition to the list and sort by condition_order
      setConditions(prev => [...prev, newCondition].sort((a, b) => a.condition_order - b.condition_order));
      setTotalConditions(prev => prev + 1);
      
      return newCondition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create condition';
      setError(errorMessage);
      console.error('Error creating condition:', err);
      return null;
    }
  };

  /**
   * Update an existing condition
   */
  const updateCondition = async (
    conditionId: string,
    conditionData: UpdateConditionRuleRequest
  ): Promise<ApiConditionRule | null> => {
    if (!ruleId) {
      console.error('useConditionRules: No ruleId provided for updating condition');
      return null;
    }

    setError(null);

    try {
      const updatedCondition = await updateConditionRule(ruleId, conditionId, conditionData);
      
      // Update the condition in the list and re-sort
      setConditions(prev => 
        prev.map(c => c.id === conditionId ? updatedCondition : c)
          .sort((a, b) => a.condition_order - b.condition_order)
      );
      
      return updatedCondition;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update condition';
      setError(errorMessage);
      console.error('Error updating condition:', err);
      return null;
    }
  };

  /**
   * Delete a condition
   */
  const deleteCondition = async (conditionId: string): Promise<boolean> => {
    if (!ruleId) {
      console.error('useConditionRules: No ruleId provided for deleting condition');
      return false;
    }

    setError(null);

    try {
      await deleteConditionRule(ruleId, conditionId);
      
      // Remove the condition from the list
      setConditions(prev => prev.filter(c => c.id !== conditionId));
      setTotalConditions(prev => prev - 1);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete condition';
      setError(errorMessage);
      console.error('Error deleting condition:', err);
      return false;
    }
  };

  // Fetch conditions when ruleId changes
  useEffect(() => {
    if (ruleId) {
      fetchConditions({ order_by: 'condition_order', order_dir: 'asc' });
    }
  }, [ruleId]);

  return {
    conditions,
    loading,
    error,
    fetchConditions,
    createCondition,
    updateCondition,
    deleteCondition,
    totalConditions,
    currentPage,
    pageSize,
  };
};
