
import { Lead } from "@/types/crm";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

// Función para extraer todas las claves únicas del campo additionalInfo
export const extractDynamicColumns = (leads: Lead[]): ColumnConfig[] => {
  const dynamicKeys = new Set<string>();
  
  leads.forEach(lead => {
    if (lead.additionalInfo && typeof lead.additionalInfo === 'object') {
      Object.keys(lead.additionalInfo).forEach(key => {
        dynamicKeys.add(key);
      });
    }
  });
  
  // Convertir las claves a configuración de columnas
  return Array.from(dynamicKeys).map(key => ({
    key: `additionalInfo.${key}`,
    label: key.charAt(0).toUpperCase() + key.slice(1), // Capitalizar primera letra
    visible: false, // Por defecto no visible para no abrumar al usuario
    sortable: true,
    isDynamic: true
  }));
};

// Función para obtener el valor de una columna dinámica
export const getDynamicColumnValue = (lead: Lead, columnKey: string): string => {
  if (!columnKey.startsWith('additionalInfo.')) return '';
  
  const key = columnKey.replace('additionalInfo.', '');
  
  if (lead.additionalInfo && typeof lead.additionalInfo === 'object') {
    const value = lead.additionalInfo[key];
    if (value === null || value === undefined) return '';
    return String(value);
  }
  
  return '';
};

// Función para agrupar las columnas dinámicas por prefijo común
export const groupDynamicColumns = (dynamicColumns: ColumnConfig[]): ColumnConfig[] => {
  // Ordenar las columnas dinámicas alfabéticamente para mantener consistencia
  return dynamicColumns.sort((a, b) => a.label.localeCompare(b.label));
};
