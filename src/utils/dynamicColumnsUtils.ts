
import { Lead } from "@/types/crm";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

// Función para extraer todas las claves únicas del campo additionalInfo
export const extractDynamicColumns = (leads: Lead[]): ColumnConfig[] => {
  console.log('🔍 Extracting dynamic columns from leads:', leads.length);
  
  const dynamicKeys = new Set<string>();
  
  leads.forEach((lead, index) => {
    console.log(`🔍 Lead ${index + 1}:`, lead.name, 'additionalInfo:', lead.additionalInfo);
    
    if (lead.additionalInfo) {
      // Verificar si additionalInfo es un objeto válido
      if (typeof lead.additionalInfo === 'object' && lead.additionalInfo !== null) {
        Object.keys(lead.additionalInfo).forEach(key => {
          console.log(`  ➕ Found dynamic key: ${key}`);
          dynamicKeys.add(key);
        });
      } else if (typeof lead.additionalInfo === 'string') {
        // Si additionalInfo es un string, intentar parsearlo como JSON
        try {
          const parsed = JSON.parse(lead.additionalInfo);
          if (typeof parsed === 'object' && parsed !== null) {
            Object.keys(parsed).forEach(key => {
              console.log(`  ➕ Found dynamic key from JSON: ${key}`);
              dynamicKeys.add(key);
            });
          }
        } catch (error) {
          console.warn(`❌ Failed to parse additionalInfo as JSON for lead ${lead.name}:`, error);
        }
      }
    }
  });
  
  console.log('🔍 All dynamic keys found:', Array.from(dynamicKeys));
  
  // Convertir las claves a configuración de columnas
  const dynamicColumns = Array.from(dynamicKeys).map(key => ({
    key: `additionalInfo.${key}`,
    label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalizar primera letra
    visible: false, // Por defecto no visible para no abrumar al usuario
    sortable: true,
    isDynamic: true
  }));
  
  console.log('✅ Dynamic columns created:', dynamicColumns);
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
