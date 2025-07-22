
/**
 * Utility functions for handling dynamic fields from AdditionalInfo
 */

export interface DynamicField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean';
  values: Set<any>;
}

export interface DynamicFieldsMap {
  [key: string]: any;
}

/**
 * Extract all unique dynamic fields from leads' AdditionalInfo
 */
export const extractDynamicFields = (leads: any[]): DynamicField[] => {
  console.log('🔍 Extracting dynamic fields from leads...');
  
  const fieldsMap = new Map<string, DynamicField>();
  
  leads.forEach(lead => {
    if (lead.additionalInfo && typeof lead.additionalInfo === 'object') {
      Object.entries(lead.additionalInfo).forEach(([key, value]) => {
        if (!fieldsMap.has(key)) {
          fieldsMap.set(key, {
            key,
            label: formatFieldLabel(key),
            type: inferFieldType(value),
            values: new Set()
          });
        }
        
        // Add value to the set for this field
        if (value !== null && value !== undefined) {
          fieldsMap.get(key)!.values.add(value);
        }
      });
    }
  });
  
  const dynamicFields = Array.from(fieldsMap.values());
  console.log('✅ Extracted dynamic fields:', dynamicFields.map(f => f.key));
  
  return dynamicFields;
};

/**
 * Format field key to a readable label
 */
const formatFieldLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Infer field type from value
 */
const inferFieldType = (value: any): 'text' | 'number' | 'date' | 'boolean' => {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  
  if (typeof value === 'string') {
    // Check if it's a date
    const dateRegex = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}|^\d{2}-\d{2}-\d{4}/;
    if (dateRegex.test(value) && !isNaN(Date.parse(value))) {
      return 'date';
    }
    
    // Check if it's a number string
    if (!isNaN(Number(value)) && value.trim() !== '') {
      return 'number';
    }
  }
  
  return 'text';
};

/**
 * Flatten AdditionalInfo into the lead object with prefixed keys
 */
export const flattenAdditionalInfo = (lead: any): any => {
  const flattened = { ...lead };
  
  if (lead.additionalInfo && typeof lead.additionalInfo === 'object') {
    Object.entries(lead.additionalInfo).forEach(([key, value]) => {
      flattened[`additional_${key}`] = value;
    });
  }
  
  return flattened;
};

/**
 * Get dynamic field value from a lead
 */
export const getDynamicFieldValue = (lead: any, fieldKey: string): any => {
  if (lead.additionalInfo && typeof lead.additionalInfo === 'object') {
    return lead.additionalInfo[fieldKey];
  }
  return null;
};
