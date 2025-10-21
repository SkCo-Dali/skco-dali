import { useState, useEffect } from 'react';
import { CommissionRule } from '@/data/commissionPlans';
import { 
  getCommissionRules, 
  createCommissionRule, 
  deleteCommissionRule,
  getCommissionRuleById
} from '@/utils/commissionRulesApiClient';
import { 
  mapApiRuleToUIRule, 
  mapUIRuleToCreateRequest 
} from '@/utils/commissionRulesApiMapper';
import { CommissionRulesQueryParams } from '@/types/commissionRulesApi';
import { useToast } from '@/hooks/use-toast';

export const useCommissionRules = (planId: string) => {
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Fetch rules for a specific plan
   */
  const fetchRules = async (params?: CommissionRulesQueryParams) => {
    if (!planId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getCommissionRules(planId, params);
      const mappedRules = response.items.map(mapApiRuleToUIRule);
      setRules(mappedRules);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener las reglas';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new rule
   */
  const createRule = async (ruleData: Partial<CommissionRule>): Promise<CommissionRule | null> => {
    if (!planId) {
      toast({
        title: 'Error',
        description: 'Se requiere el ID del plan',
        variant: 'destructive'
      });
      return null;
    }

    setLoading(true);
    
    try {
      const apiRequest = mapUIRuleToCreateRequest(ruleData);
      const apiRule = await createCommissionRule(planId, apiRequest);
      const newRule = mapApiRuleToUIRule(apiRule);
      
      setRules(prev => [...prev, newRule]);
      
      toast({
        title: 'Éxito',
        description: 'Regla creada exitosamente'
      });
      
      return newRule;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear la regla';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a rule
   */
  const deleteRule = async (ruleId: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      await deleteCommissionRule(ruleId);
      
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
      
      toast({
        title: 'Éxito',
        description: 'Regla eliminada exitosamente'
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar la regla';
      
      // Specific handling for dependency errors
      if (errorMessage.includes('dependencias') || errorMessage.includes('dependencies')) {
        toast({
          title: 'No se puede eliminar la regla',
          description: 'Esta regla tiene condiciones, incentivos o pagos asociados. Por favor elimínalos primero.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch a specific rule by ID
   */
  const fetchRuleById = async (ruleId: string): Promise<CommissionRule | null> => {
    setLoading(true);
    
    try {
      const apiRule = await getCommissionRuleById(ruleId);
      return mapApiRuleToUIRule(apiRule);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener la regla';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch rules on mount or when planId changes
  useEffect(() => {
    if (planId) {
      fetchRules();
    }
  }, [planId]);

  return {
    rules,
    loading,
    error,
    fetchRules,
    createRule,
    deleteRule,
    fetchRuleById
  };
};
