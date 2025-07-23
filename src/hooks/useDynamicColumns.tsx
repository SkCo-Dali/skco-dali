
import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { Lead } from '@/types/crm';
import { extractDynamicFields, flattenAdditionalInfo, DynamicField } from '@/utils/dynamicFieldsUtils';
import { ColumnConfig } from '@/components/LeadsTableColumnSelector';

export const useDynamicColumns = (leads: Lead[], onColumnsChange?: (columns: ColumnConfig[]) => void) => {
  const [dynamicColumns, setDynamicColumns] = useState<ColumnConfig[]>([]);
  const processedLeadsRef = useRef<string>('');
  const lastNotificationRef = useRef<number>(0);

  // Extract dynamic fields from leads
  const dynamicFields = useMemo(() => {
    if (leads.length === 0) return [];
    
    // Create a signature of the current leads to detect actual changes
    const leadsSignature = leads.map(lead => 
      `${lead.id}-${JSON.stringify(lead.additionalInfo || {})}`
    ).join('|');
    
    // Only process if leads have actually changed
    if (leadsSignature === processedLeadsRef.current) {
      return extractDynamicFields(leads);
    }
    
    processedLeadsRef.current = leadsSignature;
    console.log('🔄 Processing leads for dynamic fields...', leads.length, 'leads');
    
    // Log some sample additionalInfo to debug
    const samplesWithAdditional = leads.filter(lead => lead.additionalInfo && Object.keys(lead.additionalInfo).length > 0);
    console.log('📋 Leads with additionalInfo:', samplesWithAdditional.length);
    if (samplesWithAdditional.length > 0) {
      console.log('📋 Sample additionalInfo:', samplesWithAdditional[0].additionalInfo);
    }
    
    const fields = extractDynamicFields(leads);
    console.log('✅ Found dynamic fields:', fields.map(f => f.key));
    return fields;
  }, [leads]);

  // Update dynamic columns when fields change
  useEffect(() => {
    if (dynamicFields.length === 0) {
      setDynamicColumns([]);
      return;
    }
    
    const columns = dynamicFields.map(field => ({
      key: `additional_${field.key}`,
      label: field.label,
      visible: false,
      width: 200,
      sortable: true
    }));
    
    console.log('📊 Generated dynamic columns:', columns.map(c => `${c.key} (${c.label})`));
    setDynamicColumns(columns);
  }, [dynamicFields]);

  // Flatten leads with additional info
  const flattenedLeads = useMemo(() => {
    if (leads.length === 0) return [];
    return leads.map(flattenAdditionalInfo);
  }, [leads]);

  // Create column types map for dynamic fields
  const dynamicColumnTypes = useMemo(() => {
    if (dynamicFields.length === 0) return {};
    
    const types: Record<string, 'text' | 'number' | 'date' | 'select'> = {};
    
    dynamicFields.forEach(field => {
      types[`additional_${field.key}`] = field.type === 'boolean' ? 'select' : field.type;
    });
    
    return types;
  }, [dynamicFields]);

  // Function to merge static and dynamic columns
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

  // Notify parent when dynamic columns change
  useEffect(() => {
    if (dynamicColumns.length > 0 && onColumnsChange) {
      const now = Date.now();
      // Throttle notifications to avoid excessive calls
      if (now - lastNotificationRef.current < 2000) {
        return;
      }
      
      lastNotificationRef.current = now;
      console.log('🔔 Dynamic columns detected, notifying parent with columns:', dynamicColumns.map(c => c.key));
      
      // Create basic static columns
      const basicStaticColumns: ColumnConfig[] = [
        { key: 'name', label: 'Nombre', visible: true, sortable: true, width: 250 },
        { key: 'email', label: 'Email', visible: true, sortable: true, width: 200 },
        { key: 'phone', label: 'Teléfono', visible: true, sortable: true, width: 150 },
        { key: 'campaign', label: 'Campaña', visible: true, sortable: true, width: 200 },
        { key: 'stage', label: 'Estado', visible: true, sortable: true, width: 150 },
        { key: 'source', label: 'Fuente', visible: false, sortable: true, width: 150 },
        { key: 'assignedTo', label: 'Asignado a', visible: false, sortable: true, width: 150 },
        { key: 'priority', label: 'Prioridad', visible: false, sortable: true, width: 150 },
        { key: 'value', label: 'Valor', visible: false, sortable: true, width: 150 },
        { key: 'createdAt', label: 'Fecha creación', visible: false, sortable: true, width: 200 },
        { key: 'updatedAt', label: 'Última actualización', visible: false, sortable: true, width: 200 },
        { key: 'company', label: 'Empresa', visible: false, sortable: true, width: 200 },
        { key: 'documentNumber', label: 'Número documento', visible: false, sortable: true, width: 200 },
        { key: 'age', label: 'Edad', visible: false, sortable: true, width: 100 }
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
