
import { Lead } from "@/types/crm";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

export const extractDynamicColumns = (leads: Lead[]): ColumnConfig[] => {
  const dynamicKeys = new Set<string>();
  
  leads.forEach(lead => {
    if (lead.additionalInfo) {
      let info: any = lead.additionalInfo;
      
      // Si es string, intentar parsearlo
      if (typeof info === 'string') {
        try {
          info = JSON.parse(info);
        } catch {
          return; // Si no se puede parsear, continuar con el siguiente lead
        }
      }
      
      // Si es un objeto, agregar sus claves
      if (typeof info === 'object' && info !== null) {
        Object.keys(info).forEach(key => {
          dynamicKeys.add(key);
        });
      }
    }
  });

  // Convertir a ColumnConfig
  return Array.from(dynamicKeys).map(key => ({
    key: `additionalInfo.${key}`,
    label: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
    visible: false,
    sortable: true
  }));
};

export const getDynamicColumnValue = (lead: Lead, columnKey: string) => {
  if (!columnKey.startsWith('additionalInfo.')) {
    return lead[columnKey as keyof Lead];
  }

  const key = columnKey.replace('additionalInfo.', '');
  
  if (lead.additionalInfo) {
    let info: any = lead.additionalInfo;
    
    if (typeof info === 'string') {
      try {
        info = JSON.parse(info);
      } catch {
        return null;
      }
    }
    
    if (typeof info === 'object' && info !== null) {
      return info[key];
    }
  }
  
  return null;
};
