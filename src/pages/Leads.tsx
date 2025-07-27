import React, { useState, useEffect, useCallback } from 'react';
import { Lead } from "@/types/crm";
import { LeadsContent } from "@/components/LeadsContent";
import { LeadsActionsButton } from "@/components/LeadsActionsButton";
import { LeadsViewControls } from "@/components/LeadsViewControls";
import { LeadsStats } from "@/components/LeadsStats";
import { LeadFilters } from "@/components/LeadFilters";
import { CreateLeadDialog } from "@/components/CreateLeadDialog";
import { BulkAssignDialog } from "@/components/BulkAssignDialog";
import { MassEmailDialog } from "@/components/MassEmailDialog";
import { DeleteLeadsDialog } from "@/components/DeleteLeadsDialog";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { applyFilters } from "@/utils/filters";
import { initialColumnsConfig } from "@/components/LeadsTableColumnSelector";
import { MassWhatsAppSender } from "@/components/MassWhatsAppSender";

interface LeadsProps {
  leadsData: Lead[];
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [paginatedLeads, setPaginatedLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
  const [isMassEmailOpen, setIsMassEmailOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingLeads, setIsDeletingLeads] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'columns'>('table');
  const [groupBy, setGroupBy] = useState('stage');
  const [columns, setColumns] = useState<ColumnConfig[]>(initialColumnsConfig);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedToFilter, setAssignedToFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [portfolioFilter, setPortfolioFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [showMassWhatsApp, setShowMassWhatsApp] = useState(false);

  useEffect(() => {
    // Fetch leads from API or use dummy data
    const dummyLeads: Lead[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '3001234567',
        company: 'Acme Corp',
        product: 'Insurance',
        status: 'active',
        assignedTo: 'Carlos Rodriguez',
        priority: 'high',
        stage: 'new',
        nextFollowUp: new Date().toISOString(),
        notes: 'Contacted on 2024-01-20',
        documentType: 'CC',
        documentNumber: 123456789,
        campaign: 'Campaña A',
        portfolio: 'Portafolio 1'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '3019876543',
        company: 'Beta Inc',
        product: 'Loans',
        status: 'inactive',
        assignedTo: 'Ana Perez',
        priority: 'medium',
        stage: 'contacted',
        nextFollowUp: new Date().toISOString(),
        notes: 'Follow up on 2024-01-25',
        documentType: 'NIT',
        documentNumber: 987654321,
        campaign: 'Campaña B',
        portfolio: 'Portafolio 2'
      },
      {
        id: '3',
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        phone: '3025551212',
        company: 'Gamma Ltd',
        product: 'Credit Cards',
        status: 'active',
        assignedTo: 'Pedro Gomez',
        priority: 'low',
        stage: 'qualified',
        nextFollowUp: new Date().toISOString(),
        notes: 'Meeting scheduled for 2024-02-01',
        documentType: 'CE',
        documentNumber: 1122334455,
        campaign: 'Campaña C',
        portfolio: 'Portafolio 3'
      },
      {
        id: '4',
        name: 'Bob Williams',
        email: 'bob.williams@example.com',
        phone: '3034445656',
        company: 'Delta Corp',
        product: 'Savings Accounts',
        status: 'active',
        assignedTo: 'Laura Torres',
        priority: 'high',
        stage: 'proposal',
        nextFollowUp: new Date().toISOString(),
        notes: 'Proposal sent on 2024-02-05',
        documentType: 'PP',
        documentNumber: 6677889900,
        campaign: 'Campaña D',
        portfolio: 'Portafolio 4'
      },
      {
        id: '5',
        name: 'Eve Brown',
        email: 'eve.brown@example.com',
        phone: '3046667878',
        company: 'Epsilon Inc',
        product: 'Mortgages',
        status: 'inactive',
        assignedTo: 'David Castro',
        priority: 'medium',
        stage: 'negotiation',
        nextFollowUp: new Date().toISOString(),
        notes: 'Negotiation in progress',
        documentType: 'CC',
        documentNumber: 1010101010,
        campaign: 'Campaña E',
        portfolio: 'Portafolio 5'
      },
      {
        id: '6',
        name: 'Charlie Davis',
        email: 'charlie.davis@example.com',
        phone: '3057778989',
        company: 'Zeta Ltd',
        product: 'Retirement Plans',
        status: 'active',
        assignedTo: 'Sofia Vargas',
        priority: 'low',
        stage: 'won',
        nextFollowUp: new Date().toISOString(),
        notes: 'Deal closed on 2024-02-10',
        documentType: 'NIT',
        documentNumber: 2020202020,
        campaign: 'Campaña F',
        portfolio: 'Portafolio 6'
      },
      {
        id: '7',
        name: 'Grace Wilson',
        email: 'grace.wilson@example.com',
        phone: '3068889090',
        company: 'Eta Corp',
        product: 'Education Funds',
        status: 'inactive',
        assignedTo: 'Juan Perez',
        priority: 'high',
        stage: 'lost',
        nextFollowUp: new Date().toISOString(),
        notes: 'Lost deal due to budget',
        documentType: 'CE',
        documentNumber: 3030303030,
        campaign: 'Campaña G',
        portfolio: 'Portafolio 7'
      },
      {
        id: '8',
        name: 'Daniel Martinez',
        email: 'daniel.martinez@example.com',
        phone: '3079990101',
        company: 'Theta Inc',
        product: 'Investment Funds',
        status: 'active',
        assignedTo: 'Isabella Ramirez',
        priority: 'medium',
        stage: 'new',
        nextFollowUp: new Date().toISOString(),
        notes: 'New lead from online form',
        documentType: 'PP',
        documentNumber: 4040404040,
        campaign: 'Campaña H',
        portfolio: 'Portafolio 8'
      },
      {
        id: '9',
        name: 'Olivia Anderson',
        email: 'olivia.anderson@example.com',
        phone: '3080001212',
        company: 'Iota Ltd',
        product: 'Annuities',
        status: 'active',
        assignedTo: 'Mateo Silva',
        priority: 'low',
        stage: 'contacted',
        nextFollowUp: new Date().toISOString(),
        notes: 'Contacted via phone on 2024-02-15',
        documentType: 'CC',
        documentNumber: 5050505050,
        campaign: 'Campaña I',
        portfolio: 'Portafolio 9'
      },
      {
        id: '10',
        name: 'Liam Thomas',
        email: 'liam.thomas@example.com',
        phone: '3091112323',
        company: 'Kappa Corp',
        product: 'Life Insurance',
        status: 'active',
        assignedTo: 'Valentina Torres',
        priority: 'high',
        stage: 'qualified',
        nextFollowUp: new Date().toISOString(),
        notes: 'Qualified lead, ready for proposal',
        documentType: 'NIT',
        documentNumber: 6060606060,
        campaign: 'Campaña J',
        portfolio: 'Portafolio 10'
      }
    ];
    setLeads(dummyLeads);
    setFilteredLeads(dummyLeads);
    setPaginatedLeads(dummyLeads.slice(0, 5));
  }, []);

  useEffect(() => {
    const filtered = applyFilters(leads, {
      searchTerm,
      statusFilter,
      assignedToFilter,
      priorityFilter,
      stageFilter,
      productFilter,
      campaignFilter,
      portfolioFilter,
      ...columnFilters
    });
    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, assignedToFilter, priorityFilter, stageFilter, productFilter, campaignFilter, portfolioFilter, columnFilters]);

  const handlePageChange = (pageIndex: number, pageSize: number) => {
    const offset = pageIndex * pageSize;
    const paginated = filteredLeads.slice(offset, offset + pageSize);
    setPaginatedLeads(paginated);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
  };

  const handleLeadUpdate = () => {
    // Refresh leads data
    console.log('Lead updated, refreshing data...');
  };

  const handleCreateLead = () => {
    setIsCreateDialogOpen(true);
  };

  const handleBulkAssign = () => {
    setIsBulkAssignOpen(true);
  };

  const handleMassEmail = () => {
    setIsMassEmailOpen(true);
  };

  const handleMassWhatsApp = () => {
    console.log('Opening mass WhatsApp sender');
    setShowMassWhatsApp(true);
  };

  const handleDeleteLeads = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteLeads = async () => {
    setIsDeletingLeads(true);
    // Simulate deleting leads
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Remove selected leads from the list
    setLeads(prevLeads => prevLeads.filter(lead => !selectedLeads.includes(lead.id)));
    setSelectedLeads([]);
    setIsDeleteDialogOpen(false);
    setIsDeletingLeads(false);
  };

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    const sortedLeads = [...filteredLeads].sort((a, b) => {
      const aValue = a[sortBy as keyof Lead] || '';
      const bValue = b[sortBy as keyof Lead] || '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        // Handle non-string comparisons if necessary
        return 0;
      }
    });
    setFilteredLeads(sortedLeads);
  };

  const handleSortedLeadsChange = (sorted: Lead[]) => {
    setFilteredLeads(sorted);
  };

  const handleSendEmail = (lead: Lead) => {
    console.log('Sending email to:', lead.email);
    // Open email composer with lead's email
  };

  const handleSendWhatsApp = (lead: Lead) => {
    console.log('Opening WhatsApp with Sami for single lead:', lead.name);
    // Filter to just this lead and open the mass WhatsApp sender
    setFilteredLeads([lead]);
    setShowMassWhatsApp(true);
  };

  const handleLeadSelectionChange = (leadIds: string[], isSelected: boolean) => {
    setSelectedLeads(prevSelected => {
      if (isSelected) {
        return [...prevSelected, ...leadIds];
      } else {
        return prevSelected.filter(id => !leadIds.includes(id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <LeadFilters
        onSearch={setSearchTerm}
        onStatusChange={setStatusFilter}
        onAssignedToChange={setAssignedToFilter}
        onPriorityChange={setPriorityFilter}
        onStageChange={setStageFilter}
        onProductChange={setProductFilter}
        onCampaignChange={setCampaignFilter}
        onPortfolioChange={setPortfolioFilter}
        onColumnFiltersChange={setColumnFilters}
        columns={columns}
      />

      <div className="flex justify-between items-center">
        <LeadsStats leads={leads} />
        <div className="flex items-center gap-4">
          <LeadsActionsButton
            onCreateLead={handleCreateLead}
            onBulkAssign={handleBulkAssign}
            onMassEmail={handleMassEmail}
            onMassWhatsApp={handleMassWhatsApp}
            onDeleteLeads={handleDeleteLeads}
            selectedLeadsCount={selectedLeads.length}
            isDeleting={isDeletingLeads}
          />
          <LeadsViewControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            columns={columns}
            onColumnsChange={setColumns}
          />
        </div>
      </div>

      <LeadsContent
        viewMode={viewMode}
        leads={filteredLeads}
        onLeadClick={handleLeadClick}
        onLeadUpdate={handleLeadUpdate}
        columns={columns}
        paginatedLeads={paginatedLeads}
        onSortedLeadsChange={handleSortedLeadsChange}
        onSendEmail={handleSendEmail}
        onSendWhatsApp={handleSendWhatsApp}
        groupBy={groupBy}
        selectedLeads={selectedLeads}
        onLeadSelectionChange={handleLeadSelectionChange}
      />

      <CreateLeadDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <BulkAssignDialog
        isOpen={isBulkAssignOpen}
        onClose={() => setIsBulkAssignOpen(false)}
        selectedLeads={selectedLeads}
      />

      <MassEmailDialog
        isOpen={isMassEmailOpen}
        onClose={() => setIsMassEmailOpen(false)}
        selectedLeads={selectedLeads}
      />

      <DeleteLeadsDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDeleteLeads}
        selectedLeadsCount={selectedLeads.length}
        isDeleting={isDeletingLeads}
      />

      {showMassWhatsApp && (
        <MassWhatsAppSender
          filteredLeads={filteredLeads}
          onClose={() => {
            setShowMassWhatsApp(false);
            // Reset filtered leads if it was set for single lead
            if (filteredLeads.length === 1) {
              setFilteredLeads(applyFilters(leads, {
                searchTerm,
                statusFilter,
                assignedToFilter,
                priorityFilter,
                stageFilter,
                productFilter,
                campaignFilter,
                portfolioFilter,
                ...columnFilters
              }));
            }
          }}
        />
      )}
    </div>
  );
}
