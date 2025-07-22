
import { useMemo, useCallback, useEffect } from 'react';
import { Lead } from '@/types/crm';
import { extractDynamicFields, flattenAdditionalInfo, DynamicField } from '@/utils/dynamicFieldsUtils';
import { ColumnConfig } from '@/components/LeadsTableColumnSelector';

export const useDynamicColumns = (leads: Lead[], onColumnsChange?: (columns: ColumnConfig[]) => void) => {
  // Extract dynamic fields from leads
  const dynamicFields = useMemo(() => {
    console.log('🔄 Processing leads for dynamic fields...', leads.length, 'leads');
    const fields = extractDynamicFields(leads);
    console.log('✅ Found dynamic fields:', fields.map(f => f.key));
    return fields;
  }, [leads]);

  // Create column configs for dynamic fields
  const dynamicColumns = useMemo((): ColumnConfig[] => {
    const columns = dynamicFields.map(field => ({
      key: `additional_${field.key}`,
      label: field.label,
      visible: false, // Start hidden, user can enable them
      width: 200,
      sortable: true
    }));
    
    console.log('📊 Generated dynamic columns:', columns.map(c => `${c.key} (${c.label})`));
    return columns;
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
    
    // Check if we need to add new dynamic columns
    const existingDynamicKeys = staticColumns
      .filter(col => col.key.startsWith('additional_'))
      .map(col => col.key);
    
    const newDynamicColumns = dynamicColumns.filter(dynCol => 
      !existingDynamicKeys.includes(dynCol.key)
    );
    
    const merged = [...staticColumns, ...newDynamicColumns];
    console.log('📊 Total merged columns:', merged.length);
    console.log('📊 New dynamic columns added:', newDynamicColumns.length);
    console.log('📊 All dynamic column keys:', merged.filter(c => c.key.startsWith('additional_')).map(c => c.key));
    
    return merged;
  }, [dynamicColumns]);

  // Notify parent when dynamic columns change
  useEffect(() => {
    if (dynamicColumns.length > 0 && onColumnsChange) {
      console.log('🔔 Dynamic columns detected, notifying parent...');
      // Create a basic set of static columns for merging
      const basicStaticColumns: ColumnConfig[] = [
        { key: 'name', label: 'Nombre', visible: true, sortable: true, width: 250 },
        { key: 'email', label: 'Email', visible: true, sortable: true, width: 200 },
        { key: 'phone', label: 'Teléfono', visible: true, sortable: true, width: 150 },
        { key: 'campaign', label: 'Campaña', visible: true, sortable: true, width: 200 },
        { key: 'stage', label: 'Estado', visible: true, sortable: true, width: 150 }
      ];
      
      const mergedColumns = mergeColumns(basicStaticColumns);
      onColumnsChange(mergedColumns);
    }
  }, [dynamicColumns, onColumnsChange, mergeColumns]);

  return {
    dynamicFields,
    dynamicColumns,
    flattenedLeads,
    dynamicColumnTypes,
    mergeColumns
  };
};
