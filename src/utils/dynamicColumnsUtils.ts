
import { Lead } from "@/types/crm";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

// Función para extraer todas las claves únicas del campo additionalInfo
export const extractDynamicColumns = (leads: Lead[]): ColumnConfig[] => {
  console.log('🔍 extractDynamicColumns - Starting with leads:', leads.length);
  
  const dynamicKeys = new Set<string>();
  
  leads.forEach((lead, index) => {
    console.log(`🔍 Lead ${index + 1}:`, lead.name);
    console.log(`🔍 Lead ${index + 1} additionalInfo:`, lead.additionalInfo);
    console.log(`🔍 Lead ${index + 1} additionalInfo type:`, typeof lead.additionalInfo);
    
    if (lead.additionalInfo) {
      let additionalInfoObj = lead.additionalInfo;
      
      // Si additionalInfo es un string, intentar parsearlo como JSON
      if (typeof lead.additionalInfo === 'string') {
        try {
          additionalInfoObj = JSON.parse(lead.additionalInfo);
          console.log(`🔍 Lead ${index + 1} parsed additionalInfo:`, additionalInfoObj);
        } catch (error) {
          console.warn(`❌ Failed to parse additionalInfo as JSON for lead ${lead.name}:`, error);
          return; // Skip this lead if parsing fails
        }
      }
      
      // Verificar si additionalInfo es un objeto válido
      if (typeof additionalInfoObj === 'object' && additionalInfoObj !== null) {
        const keys = Object.keys(additionalInfoObj);
        console.log(`🔍 Lead ${index + 1} additionalInfo keys:`, keys);
        keys.forEach(key => {
          console.log(`  ➕ Adding dynamic key: ${key}`);
          dynamicKeys.add(key);
        });
      } else {
        console.warn(`❌ additionalInfo is not an object for lead ${lead.name}:`, additionalInfoObj);
      }
    }
  });
  
  console.log('🔍 extractDynamicColumns - All dynamic keys found:', Array.from(dynamicKeys));
  
  // Convertir las claves a configuración de columnas
  const dynamicColumns = Array.from(dynamicKeys).map(key => {
    const column = {
      key: `additionalInfo.${key}`,
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), // Capitalizar y limpiar underscores
      visible: false, // Por defecto no visible para no abrumar al usuario
      sortable: true,
      isDynamic: true
    };
    console.log('✅ Created dynamic column:', column);
    return column;
  });
  
  console.log('✅ extractDynamicColumns - Final dynamic columns:', dynamicColumns);
  return dynamicColumns;
};

// Función para obtener el valor de una columna dinámica
export const getDynamicColumnValue = (lead: Lead, columnKey: string): string => {
  if (!columnKey.startsWith('additionalInfo.')) return '';
  
  const key = columnKey.replace('additionalInfo.', '');
  
  if (lead.additionalInfo) {
    let additionalInfoObj = lead.additionalInfo;
    
    // Si additionalInfo es un string, parsearlo
    if (typeof additionalInfoObj === 'string') {
      try {
        additionalInfoObj = JSON.parse(additionalInfoObj);
      } catch (error) {
        console.warn('Failed to parse additionalInfo:', error);
        return '';
      }
    }
    
    // Verificar que sea un objeto
    if (typeof additionalInfoObj === 'object' && additionalInfoObj !== null) {
      const value = additionalInfoObj[key];
      if (value === null || value === undefined) return '';
      return String(value);
    }
  }
  
  return '';
};

// Función para agrupar las columnas dinámicas por prefijo común
export const groupDynamicColumns = (dynamicColumns: ColumnConfig[]): ColumnConfig[] => {
  // Ordenar las columnas dinámicas alfabéticamente para mantener consistencia
  return dynamicColumns.sort((a, b) => a.label.localeCompare(b.label));
};
