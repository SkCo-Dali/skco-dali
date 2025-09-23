import { IOpportunity, ICustomer, OpportunityFilters, SortOption, OpportunityStats } from '@/types/opportunities';
import { getOpportunitySummary, loadLeadsFromOpportunity, updateOpportunityFavourite } from '@/utils/opportunitiesApiClient';
import { mapApiOpportunityToOpportunity } from '@/utils/opportunitiesApiMapper';
import { Lead, LeadStatus, LeadSource, Priority, Campaign, Portfolio } from '@/types/crm';

// Import mock data as fallback
import mockOpportunities from '@/data/mockOpportunities.json';
import mockCustomers from '@/data/mockCustomers.json';

class OpportunitiesService {
  private favorites: Set<string> = new Set();

  constructor() {
    this.loadFavorites();
  }

  private loadFavorites() {
    try {
      const stored = localStorage.getItem('opportunity-favorites');
      if (stored) {
        this.favorites = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  private saveFavorites() {
    try {
      localStorage.setItem('opportunity-favorites', JSON.stringify([...this.favorites]));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  async getOpportunities(filters?: OpportunityFilters, sort?: SortOption): Promise<IOpportunity[]> {
    const apiOpportunities = await getOpportunitySummary();
    let opportunities = apiOpportunities.map(mapApiOpportunityToOpportunity);
    
    console.log('✅ Using real API data:', opportunities.length, 'opportunities');
    
    // Apply filters
    if (filters) {
      opportunities = this.applyFilters(opportunities, filters);
    }
    
    // Apply sorting
    if (sort) {
      opportunities = this.applySorting(opportunities, sort);
    }
    
    return opportunities;
  }

  private applyFilters(opportunities: IOpportunity[], filters: OpportunityFilters): IOpportunity[] {
    return opportunities.filter(opp => {
      // Filter by type
      if (filters.type && filters.type.length > 0 && !filters.type.includes(opp.type)) {
        return false;
      }
      
      // Filter by priority
      if (filters.priority && filters.priority.length > 0 && !filters.priority.includes(opp.priority)) {
        return false;
      }
      
      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${opp.title} ${opp.subtitle} ${opp.description}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }
      
      // Filter by customer count
      if (filters.customerCount) {
        if (opp.customerCount < filters.customerCount.min || opp.customerCount > filters.customerCount.max) {
          return false;
        }
      }
      
      // Filter by score
      if (filters.score) {
        if (opp.score < filters.score.min || opp.score > filters.score.max) {
          return false;
        }
      }
      
      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => opp.tags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
      
      // Filter by favorites
      if (filters.onlyFavorites && !this.isFavorite(opp.id)) {
        return false;
      }
      
      return true;
    });
  }

  private applySorting(opportunities: IOpportunity[], sort: SortOption): IOpportunity[] {
    const sorted = [...opportunities];
    
    switch (sort) {
      case 'relevance':
        return sorted.sort((a, b) => b.score - a.score);
      case 'customers':
        return sorted.sort((a, b) => b.customerCount - a.customerCount);
      case 'recent':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'expiring':
        return sorted.sort((a, b) => {
          const aExpires = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
          const bExpires = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
          return aExpires - bExpires;
        });
      default:
        return sorted;
    }
  }

  async getOpportunityById(id: string): Promise<IOpportunity | null> {
    const opportunities = await this.getOpportunities();
    return opportunities.find(opp => opp.id === id) || null;
  }

  async getCustomersByOpportunityId(opportunityId: string): Promise<ICustomer[]> {
    // For now, return mock customers filtered by opportunityId
    const customers = mockCustomers as ICustomer[];
    return customers.filter(customer => customer.opportunityId === opportunityId);
  }

  async getHighlightedOpportunities(): Promise<IOpportunity[]> {
    const opportunities = await this.getOpportunities();
    return opportunities.filter(opp => opp.isHighlighted).slice(0, 6);
  }

  async getStats(): Promise<OpportunityStats> {
    const opportunities = await this.getOpportunities();
    
    return {
      totalOpportunities: opportunities.length,
      totalCustomers: opportunities.reduce((sum, opp) => sum + opp.customerCount, 0),
      favoritesCount: this.favorites.size,
      avgScore: opportunities.length > 0 
        ? opportunities.reduce((sum, opp) => sum + opp.score, 0) / opportunities.length 
        : 0,
      totalCommissionPotential: opportunities.reduce((sum, opp) => 
        sum + (opp.metrics?.estimatedSales || 0), 0
      ),
    };
  }

  async toggleFavorite(opportunityId: string): Promise<boolean> {
    const currentIsFavorite = this.favorites.has(opportunityId);
    const newIsFavorite = !currentIsFavorite;
    
    try {
      // Call API to update favorite status
      const response = await updateOpportunityFavourite(parseInt(opportunityId), newIsFavorite);
      
      if (response.success) {
        // Update local state only if API call was successful
        if (newIsFavorite) {
          this.favorites.add(opportunityId);
        } else {
          this.favorites.delete(opportunityId);
        }
        this.saveFavorites();
        return newIsFavorite;
      } else {
        throw new Error(response.message || 'Failed to update favorite status');
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      // Don't update local state if API call fails
      throw error;
    }
  }

  isFavorite(opportunityId: string): boolean {
    return this.favorites.has(opportunityId);
  }

  // Simulation methods for user actions (keeping existing functionality)
  async simulateBulkEmail(opportunityId: string, customerIds: string[]): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      message: `Email enviado a ${customerIds.length} clientes para la oportunidad ${opportunityId}`
    };
  }

  async simulateBulkWhatsApp(opportunityId: string, customerIds: string[]): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      message: `WhatsApp enviado a ${customerIds.length} clientes para la oportunidad ${opportunityId}`
    };
  }

  async simulateAssignToSales(opportunityId: string, salesRepId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      message: `Oportunidad ${opportunityId} asignada al vendedor ${salesRepId}`
    };
  }

  async simulateLoadCampaign(opportunityId: string): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return {
      success: true,
      message: `Campaña cargada para la oportunidad ${opportunityId}`
    };
  }

  async loadAsLeads(opportunityId: string): Promise<Lead[]> {
    const numericId = parseInt(opportunityId, 10);
    if (isNaN(numericId)) {
      throw new Error('ID de oportunidad inválido');
    }

    try {
      const apiLeads = await loadLeadsFromOpportunity(numericId);
      
      // Convert API response to Lead format
      const leads: Lead[] = apiLeads.map(apiLead => ({
        id: `${apiLead.documentNumber}`, // Using document number as unique ID
        name: apiLead.name,
        email: apiLead.email,
        phone: apiLead.phone,
        status: 'New' as LeadStatus,
        source: (apiLead.source || 'Other') as LeadSource,
        priority: (apiLead.priority === 'Alta' ? 'High' : 
                  apiLead.priority === 'Media' ? 'Medium' : 'Low') as Priority,
        campaign: (apiLead.campaign || '') as Campaign,
        portfolio: '' as Portfolio,
        product: Array.isArray(apiLead.product) ? apiLead.product.join(', ') : '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stage: apiLead.stage,
        assignedTo: apiLead.assignedTo,
        createdBy: apiLead.CreatedBy,
        company: apiLead.company || '',
        value: apiLead.value,
        notes: apiLead.notes || '',
        documentType: apiLead.DocumentType,
        documentNumber: apiLead.documentNumber,
        age: apiLead.Age,
        gender: apiLead.Gender,
        preferredContactChannel: apiLead.PreferredContactChannel,
        portfolios: apiLead.SelectedPortfolios || [],
        tags: apiLead.tags || [],
        nextFollowUp: apiLead.nextFollowUp,
      }));

      return leads;
    } catch (error) {
      console.error('Error loading leads from opportunity:', error);
      throw error;
    }
  }

  private trackEvent(event: string, data: any): void {
    console.log(`📊 Analytics Event: ${event}`, data);
  }

  getFilterOptions() {
    return {
      types: ['birthday', 'cross-sell', 'retention', 'reactivation', 'campaign', 'ai-recommendation', 'recent-contact', 'risk-advisory', 'churn-risk', 'life-events'] as const,
      priorities: ['alta', 'media', 'baja'] as const,
      tags: ['Cumpleaños', 'Fidelización', 'Venta cruzada', 'Reactivación', 'Campaña', 'IA', 'Contacto Reciente', 'Riesgo', 'Eventos de Vida'],
    };
  }
}

export const opportunitiesService = new OpportunitiesService();
