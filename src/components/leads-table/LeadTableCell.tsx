import { Lead } from "@/types/crm";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditableLeadCell } from "@/components/EditableLeadCell";
import { LeadActionDropdown } from "./LeadActionDropdown";

interface LeadTableCellProps {
  lead: Lead;
  columnKey: string;
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
}

export function LeadTableCell({ lead, columnKey, onLeadClick, onLeadUpdate }: LeadTableCellProps) {
  const renderCellContent = () => {
    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center justify-between w-full">
            <div className="text-gray-900 font-medium text-xs truncate pr-2">
              {lead.name}
            </div>
            <LeadActionDropdown lead={lead} onLeadClick={onLeadClick} />
          </div>
        );
      case 'email':
        return (
          <EditableLeadCell
            lead={lead}
            field="email"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'phone':
        return (
          <EditableLeadCell
            lead={lead}
            field="phone"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'company':
        return (
          <EditableLeadCell
            lead={lead}
            field="company"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'documentNumber':
        return (
          <EditableLeadCell
            lead={lead}
            field="documentNumber"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'product':
        return (
          <span className="text-gray-700 text-xs">
            {lead.product || '-'}
          </span>
        );
      case 'campaign':
        return (
          <span className="text-gray-700 text-xs">
            {lead.campaign || '-'}
          </span>
        );
      case 'source':
        return <span className="text-gray-700 text-xs capitalize">{lead.source}</span>;
      case 'stage':
        return (
          <EditableLeadCell
            lead={lead}
            field="stage"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'assignedTo':
        return (
          <EditableLeadCell
            lead={lead}
            field="assignedTo"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'lastInteraction':
        return (
          <span className="text-gray-700 text-xs">
            {format(new Date(lead.updatedAt), "dd/MM/yyyy", { locale: es })}
          </span>
        );
      case 'value':
        return <span className="text-gray-800 font-medium text-xs">${lead.value.toLocaleString()}</span>;
      case 'priority':
        return (
          <EditableLeadCell
            lead={lead}
            field="priority"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'createdAt':
        return (
          <span className="text-gray-700 text-xs">
            {format(new Date(lead.createdAt), "dd/MM/yyyy", { locale: es })}
          </span>
        );
      case 'age':
        return <span className="text-gray-700 text-xs">{lead.age || '-'}</span>;
      case 'gender':
        return <span className="text-gray-700 text-xs">{lead.gender || '-'}</span>;
      case 'preferredContactChannel':
        return <span className="text-gray-700 text-xs">{lead.preferredContactChannel || '-'}</span>;
      case 'documentType':
        return <span className="text-gray-700 text-xs">{lead.documentType || '-'}</span>;
      default:
        return null;
    }
  };

  return <>{renderCellContent()}</>;
}
