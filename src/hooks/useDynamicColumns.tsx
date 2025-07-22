
import { useMemo, useCallback, useEffect, useRef } from 'react';
import { Lead } from '@/types/crm';
import { extractDynamicFields, flattenAdditionalInfo, DynamicField } from '@/utils/dynamicFieldsUtils';
import { ColumnConfig } from '@/components/LeadsTableColumnSelector';

export const useDynamicColumns = (leads: Lead[], onColumnsChange?: (columns: ColumnConfig[]) => void) => {
  // Use ref to track if we've already processed these leads
  const processedLeadsRef = useRef<Lead[]>([]);
  const lastNotificationRef = useRef<number>(0);

  // Extract dynamic fields from leads - only when leads actually change
  const dynamicFields = useMemo(() => {
    // Only process if leads have actually changed (not just re-rendered)
    if (leads === processedLeadsRef.current || leads.length === 0) {
      return [];
    }
    
    // Check if leads content has actually changed by comparing first few items
    const hasChanged = !processedLeadsRef.current || 
      processedLeadsRef.current.length !== leads.length ||
      (leads.length > 0 && processedLeadsRef.current.length > 0 && 
       leads[0].id !== processedLeadsRef.current[0].id);

    if (!hasChanged) {
      return [];
    }

    processedLeadsRef.current = leads;
    console.log('🔄 Processing leads for dynamic fields...', leads.length, 'leads');
    const fields = extractDynamicFields(leads);
    console.log('✅ Found dynamic fields:', fields.map(f => f.key));
    return fields;
  }, [leads]);

  // Create column configs for dynamic fields - stable reference
  const dynamicColumns = useMemo((): ColumnConfig[] => {
    if (dynamicFields.length === 0) return [];
    
    const columns = dynamicFields.map(field => ({
      key: `additional_${field.key}`,
      label: field.label,
      visible: false,
      width: 200,
      sortable: true
    }));
    
    console.log('📊 Generated dynamic columns:', columns.map(c => `${c.key} (${c.label})`));
    return columns;
  }, [dynamicFields]);

  // Flatten leads with additional info - only when needed
  const flattenedLeads = useMemo(() => {
    if (leads.length === 0) return [];
    return leads.map(flattenAdditionalInfo);
  }, [leads]);

  // Create column types map for dynamic fields - stable reference
  const dynamicColumnTypes = useMemo(() => {
    if (dynamicFields.length === 0) return {};
    
    const types: Record<string, 'text' | 'number' | 'date' | 'select'> = {};
    
    dynamicFields.forEach(field => {
      types[`additional_${field.key}`] = field.type === 'boolean' ? 'select' : field.type;
    });
    
    return types;
  }, [dynamicFields]);

  // Function to merge static and dynamic columns - stable reference
  const mergeColumns = useCallback((staticColumns: ColumnConfig[]) => {
    if (dynamicColumns.length === 0) return staticColumns;
    
    console.log('🔄 Merging static and dynamic columns...');
    console.log('📊 Static columns count:', staticColumns.length);
    console.log('📊 Dynamic columns count:', dynamicColumns.length);
    
    const existingDynamicKeys = staticColumns
      .filter(col => col.key.startsWith('additional_'))
      .map(col => col.key);
    
    const newDynamicColumns = dynamicColumns.filter(dynCol => 
      !existingDynamicKeys.includes(dynCol.key)
    );
    
    const merged = [...staticColumns, ...newDynamicColumns];
    console.log('📊 Total merged columns:', merged.length);
    console.log('📊 New dynamic columns added:', newDynamicColumns.length);
    
    return merged;
  }, [dynamicColumns]);

  // Notify parent when dynamic columns change - throttled
  useEffect(() => {
    if (dynamicColumns.length > 0 && onColumnsChange) {
      const now = Date.now();
      // Throttle notifications to avoid excessive calls
      if (now - lastNotificationRef.current < 1000) {
        return;
      }
      
      lastNotificationRef.current = now;
      console.log('🔔 Dynamic columns detected, notifying parent...');
      
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
  }, [dynamicColumns.length, onColumnsChange, mergeColumns]); // Only depend on length, not the array itself

  return {
    dynamicFields,
    dynamicColumns,
    flattenedLeads,
    dynamicColumnTypes,
    mergeColumns
  };
};
