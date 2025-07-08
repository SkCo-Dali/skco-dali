
import { useState } from "react";
import { Lead } from "@/types/crm";
import { useUsersApi } from "@/hooks/useUsersApi";
import { SortConfig } from "./types";

export const useLeadsTableSort = (leads: Lead[], onSortedLeadsChange?: (sortedLeads: Lead[]) => void) => {
  const { users } = useUsersApi();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
    
    const sortedLeads = [...leads].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (columnKey) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'product':
          aValue = (a.product || '').toLowerCase();
          bValue = (b.product || '').toLowerCase();
          break;
        case 'campaign':
          aValue = (a.campaign || '').toLowerCase();
          bValue = (b.campaign || '').toLowerCase();
          break;
        case 'source':
          aValue = a.source.toLowerCase();
          bValue = b.source.toLowerCase();
          break;
        case 'stage':
          aValue = a.stage;
          bValue = b.stage;
          break;
        case 'assignedTo':
          const assignedUserA = users.find(u => u.id === a.assignedTo);
          const assignedUserB = users.find(u => u.id === b.assignedTo);
          aValue = (assignedUserA?.name || a.assignedTo || 'Sin asignar').toLowerCase();
          bValue = (assignedUserB?.name || b.assignedTo || 'Sin asignar').toLowerCase();
          break;
        case 'lastInteraction':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'phone':
          aValue = (a.phone || '').toLowerCase();
          bValue = (b.phone || '').toLowerCase();
          break;
        case 'company':
          aValue = (a.company || '').toLowerCase();
          bValue = (b.company || '').toLowerCase();
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'priority':
          const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 'gender':
          aValue = (a.gender || '').toLowerCase();
          bValue = (b.gender || '').toLowerCase();
          break;
        case 'preferredContactChannel':
          aValue = (a.preferredContactChannel || '').toLowerCase();
          bValue = (b.preferredContactChannel || '').toLowerCase();
          break;
        case 'documentType':
          aValue = (a.documentType || '').toLowerCase();
          bValue = (b.documentType || '').toLowerCase();
          break;
        case 'documentNumber':
          aValue = a.documentNumber || 0;
          bValue = b.documentNumber || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    onSortedLeadsChange?.(sortedLeads);
  };

  return {
    sortConfig,
    handleSort
  };
};
