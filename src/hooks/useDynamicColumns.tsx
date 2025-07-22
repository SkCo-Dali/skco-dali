
import { useMemo } from 'react';
import { Lead } from '@/types/crm';
import { extractDynamicFields, flattenAdditionalInfo, DynamicField } from '@/utils/dynamicFieldsUtils';
import { ColumnConfig } from '@/components/LeadsTableColumnSelector';

export const useDynamicColumns = (leads: Lead[]) => {
  // Extract dynamic fields from leads
  const dynamicFields = useMemo(() => {
    console.log('🔄 Processing leads for dynamic fields...');
    return extractDynamicFields(leads);
  }, [leads]);

  // Create column configs for dynamic fields
  const dynamicColumns = useMemo((): ColumnConfig[] => {
    return dynamicFields.map(field => ({
      key: `additional_${field.key}`,
      label: field.label,
      visible: false, // Start hidden, user can enable them
      width: 200
    }));
  }, [dynamicFields]);

  // Flatten leads with additional info
  const flattenedLeads = useMemo(() => {
    console.log('🔄 Flattening leads with additional info...');
    return leads.map(flattenAdditionalInfo);
  }, [leads]);

  // Create column types map for dynamic fields
  const dynamicColumnTypes = useMemo(() => {
    const types: Record<string, 'text' | 'number' | 'date' | 'select'> = {};
    
    dynamicFields.forEach(field => {
      types[`additional_${field.key}`] = field.type === 'boolean' ? 'select' : field.type;
    });
    
    return types;
  }, [dynamicFields]);

  return {
    dynamicFields,
    dynamicColumns,
    flattenedLeads,
    dynamicColumnTypes
  };
};
