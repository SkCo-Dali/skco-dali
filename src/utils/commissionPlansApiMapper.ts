import { ApiCommissionPlan } from '@/types/commissionPlansApi';
import { CommissionPlan } from '@/data/commissionPlans';

// Map API response to UI format
export const mapApiCommissionPlanToUI = (apiPlan: ApiCommissionPlan): CommissionPlan => {
  return {
    id: apiPlan.id,
    name: apiPlan.name,
    description: apiPlan.description,
    startDate: apiPlan.start_date,
    endDate: apiPlan.end_date,
    assignmentType: apiPlan.assignment_type,
    assignmentValue: apiPlan.assignment_value || undefined,
    status: apiPlan.status,
    publishedOn: apiPlan.published_on || undefined,
    rules: [] // Rules will be loaded separately when needed
  };
};

// Map UI format to API request format
export const mapUICommissionPlanToAPI = (uiPlan: Partial<CommissionPlan>) => {
  const apiData: any = {};
  
  if (uiPlan.name) apiData.name = uiPlan.name;
  if (uiPlan.description) apiData.description = uiPlan.description;
  if (uiPlan.startDate) apiData.start_date = uiPlan.startDate;
  if (uiPlan.endDate) apiData.end_date = uiPlan.endDate;
  if (uiPlan.assignmentType) apiData.assignment_type = uiPlan.assignmentType;
  if (uiPlan.assignmentValue) apiData.assignment_value = uiPlan.assignmentValue;
  
  return apiData;
};

// Format date for API (convert to ISO string with time)
export const formatDateForAPI = (dateString: string, isEndDate = false): string => {
  const date = new Date(dateString);
  
  if (isEndDate) {
    // End dates should be set to end of day
    date.setHours(23, 59, 59, 999);
  } else {
    // Start dates should be set to beginning of day
    date.setHours(0, 0, 0, 0);
  }
  
  return date.toISOString();
};