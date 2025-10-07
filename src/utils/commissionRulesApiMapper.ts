import { ApiCommissionRule, CreateCommissionRuleRequest } from '@/types/commissionRulesApi';
import { CommissionRule } from '@/data/commissionPlans';

/**
 * Maps API Commission Rule to UI Commission Rule
 */
export const mapApiRuleToUIRule = (apiRule: ApiCommissionRule): CommissionRule => {
  return {
    id: apiRule.id,
    name: apiRule.name,
    formula: apiRule.formula,
    conditions: '', // API doesn't return conditions directly, would need to fetch separately
    catalog: apiRule.catalog,
    description: apiRule.description || undefined,
    owner: apiRule.owner_name || undefined,
    dataField: apiRule.data_field || undefined,
  };
};

/**
 * Maps UI Rule data to API Create Rule Request
 */
export const mapUIRuleToCreateRequest = (
  uiRule: Partial<CommissionRule>
): CreateCommissionRuleRequest => {
  return {
    name: uiRule.name || '',
    description: uiRule.description,
    formula: uiRule.formula || '',
    catalog: uiRule.catalog || '',
    date_field: uiRule.dataField,
    owner_name: uiRule.owner,
    is_active: true, // Default to active
  };
};
