
import { Lead } from "@/types/crm";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

// Función para extraer todas las claves únicas del campo additionalInfo
export const extractDynamicColumns = (leads: Lead[]): ColumnConfig[] => {
  console.log('🔍 extractDynamicColumns - Starting with leads:', leads.length);
  
  const dynamicKeys = new Set<string>();
  
  leads.forEach((lead, index) => {
    console.log(`🔍 Processing lead ${index + 1}:`, lead.name);
    console.log(`🔍 Lead additionalInfo raw:`, lead.additionalInfo);
    
    if (lead.additionalInfo) {
      let parsedInfo;
      
      // Si es string, intentar parsear como JSON
      if (typeof lead.additionalInfo === 'string') {
        try {
          parsedInfo = JSON.parse(lead.additionalInfo);
          console.log(`✅ Successfully parsed additionalInfo for ${lead.name}:`, parsedInfo);
        } catch (e) {
          console.warn(`❌ Failed to parse additionalInfo for ${lead.name}:`, e);
          // Si no se puede parsear como JSON, saltar este lead
          return;
        }
      } else if (typeof lead.additionalInfo === 'object' && lead.additionalInfo !== null) {
        // Si ya es un objeto, usarlo directamente
        parsedInfo = lead.additionalInfo;
        console.log(`✅ Using object additionalInfo for ${lead.name}:`, parsedInfo);
      } else {
        // Si no es ni string ni objeto, saltar este lead
        return;
      }
      
      // Extraer claves del objeto parseado
      if (parsedInfo && typeof parsedInfo === 'object' && parsedInfo !== null) {
        Object.keys(parsedInfo).forEach(key => {
          const value = parsedInfo[key];
          // Solo agregar claves que tengan valores no vacíos
          if (value !== null && value !== undefined && value !== '') {
            console.log(`  ➕ Adding dynamic key: ${key} = ${value}`);
            dynamicKeys.add(key);
          }
        });
      }
    }
  });
  
  console.log('🔍 All dynamic keys found:', Array.from(dynamicKeys));
  
  // Convertir las claves a configuración de columnas
  const dynamicColumns = Array.from(dynamicKeys).map(key => ({
    key: `additionalInfo.${key}`,
    label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
    visible: false,
    sortable: true,
    isDynamic: true
  }));
  
  console.log('✅ Final dynamic columns created:', dynamicColumns);
  return dynamicColumns;
};

// Función para obtener el valor de una columna dinámica
export const getDynamicColumnValue = (lead: Lead, columnKey: string): string => {
  if (!columnKey.startsWith('additionalInfo.')) return '';
  
  const key = columnKey.replace('additionalInfo.', '');
  
  if (lead.additionalInfo) {
    let parsedInfo;
    
    // Si es string, intentar parsear como JSON
    if (typeof lead.additionalInfo === 'string') {
      try {
        parsedInfo = JSON.parse(lead.additionalInfo);
      } catch (e) {
        console.warn('Failed to parse additionalInfo:', e);
        return '';
      }
    } else if (typeof lead.additionalInfo === 'object' && lead.additionalInfo !== null) {
      // Si ya es un objeto, usarlo directamente
      parsedInfo = lead.additionalInfo;
    } else {
      return '';
    }
    
    // Obtener el valor de la clave
    if (parsedInfo && typeof parsedInfo === 'object' && parsedInfo !== null) {
      const value = parsedInfo[key];
      if (value === null || value === undefined) return '';
      return String(value);
    }
  }
  
  return '';
};

// Función para agrupar las columnas dinámicas por prefijo común
export const groupDynamicColumns = (dynamicColumns: ColumnConfig[]): ColumnConfig[] => {
  return dynamicColumns.sort((a, b) => a.label.localeCompare(b.label));
};
