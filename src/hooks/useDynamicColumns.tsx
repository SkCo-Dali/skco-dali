
import { useMemo, useCallback } from 'react';
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
      width: 200,
      sortable: true
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

  // Function to merge static and dynamic columns
  const mergeColumns = useCallback((staticColumns: ColumnConfig[]) => {
    console.log('🔄 Merging static and dynamic columns...');
    console.log('📊 Static columns count:', staticColumns.length);
    console.log('📊 Dynamic columns count:', dynamicColumns.length);
    
    const merged = [...staticColumns, ...dynamicColumns];
    console.log('📊 Total merged columns:', merged.length);
    console.log('📊 Dynamic column keys:', dynamicColumns.map(c => c.key));
    
    return merged;
  }, [dynamicColumns]);

  return {
    dynamicFields,
    dynamicColumns,
    flattenedLeads,
    dynamicColumnTypes,
    mergeColumns
  };
};
