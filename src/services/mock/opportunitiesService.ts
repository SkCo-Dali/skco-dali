import { IOpportunity, ICustomer, OpportunityFilters, SortOption, OpportunityStats } from '@/types/opportunities';
import mockOpportunities from '@/data/mockOpportunities.json';
import mockCustomers from '@/data/mockCustomers.json';

const STORAGE_KEY = 'market_dali_favorites';
const USER_ID_MOCK = 'user123'; // TODO: Replace with actual user ID from auth

export class OpportunitiesService {
  private opportunities: IOpportunity[] = mockOpportunities as IOpportunity[];
  private customers: ICustomer[] = mockCustomers as ICustomer[];

  // Simulate network delay
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getOpportunities(filters?: OpportunityFilters, sort?: SortOption): Promise<IOpportunity[]> {
    await this.delay(800); // Simulate API call
    
    let filtered = [...this.opportunities];

    if (filters) {
      if (filters.type?.length) {
        filtered = filtered.filter(opp => filters.type!.includes(opp.type));
      }

      if (filters.priority?.length) {
        filtered = filtered.filter(opp => filters.priority!.includes(opp.priority));
      }

      if (filters.product?.length) {
        filtered = filtered.filter(opp => 
          filters.product!.some(product => 
            opp.suggestedProduct.toLowerCase().includes(product.toLowerCase())
          )
        );
      }

      if (filters.customerCount) {
        const { min, max } = filters.customerCount;
        filtered = filtered.filter(opp => 
          opp.customerCount >= min && opp.customerCount <= max
        );
      }

      if (filters.score) {
        const { min, max } = filters.score;
        filtered = filtered.filter(opp => 
          opp.score >= min && opp.score <= max
        );
      }

      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(opp =>
          opp.title.toLowerCase().includes(search) ||
          opp.subtitle.toLowerCase().includes(search) ||
          opp.description.toLowerCase().includes(search) ||
          opp.tags.some(tag => tag.toLowerCase().includes(search))
        );
      }

      if (filters.tags?.length) {
        filtered = filtered.filter(opp =>
          filters.tags!.some(tag => 
            opp.tags.some(oppTag => 
              oppTag.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
      }

      if (filters.onlyFavorites) {
        const favorites = this.getFavorites();
        filtered = filtered.filter(opp => favorites.includes(opp.id));
      }
    }

    // Apply sorting
    if (sort) {
      switch (sort) {
        case 'relevance':
          filtered.sort((a, b) => b.score - a.score);
          break;
        case 'customers':
          filtered.sort((a, b) => b.customerCount - a.customerCount);
          break;
        case 'recent':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'expiring':
          filtered.sort((a, b) => {
            const aExpires = a.expiresAt ? new Date(a.expiresAt).getTime() : Infinity;
            const bExpires = b.expiresAt ? new Date(b.expiresAt).getTime() : Infinity;
            return aExpires - bExpires;
          });
          break;
      }
    }

    console.log('📊 Opportunities fetched:', { total: filtered.length, filters, sort });
    return filtered;
  }

  async getOpportunityById(id: string): Promise<IOpportunity | null> {
    await this.delay(300);
    
    const opportunity = this.opportunities.find(opp => opp.id === id);
    if (opportunity) {
      console.log('📈 Opportunity viewed:', { id, title: opportunity.title });
      // Simulate analytics event
      this.trackEvent('opportunity_viewed', { opportunityId: id, title: opportunity.title });
    }
    
    return opportunity || null;
  }

  async getCustomersByOpportunityId(opportunityId: string): Promise<ICustomer[]> {
    await this.delay(500);
    
    const customers = this.customers.filter(customer => customer.opportunityId === opportunityId);
    console.log('👥 Customers fetched for opportunity:', { opportunityId, count: customers.length });
    
    return customers;
  }

  async getHighlightedOpportunities(): Promise<IOpportunity[]> {
    await this.delay(400);
    
    const highlighted = this.opportunities
      .filter(opp => opp.isHighlighted)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    console.log('⭐ Highlighted opportunities fetched:', highlighted.length);
    return highlighted;
  }

  async getStats(): Promise<OpportunityStats> {
    await this.delay(200);
    
    const favorites = this.getFavorites();
    const totalCustomers = this.opportunities.reduce((sum, opp) => sum + opp.customerCount, 0);
    const avgScore = this.opportunities.reduce((sum, opp) => sum + opp.score, 0) / this.opportunities.length;
    
    return {
      totalOpportunities: this.opportunities.length,
      totalCustomers,
      favoritesCount: favorites.length,
      avgScore: Math.round(avgScore * 10) / 10,
      totalCommissionPotential: this.opportunities.reduce((sum, opp) => 
        sum + (opp.metrics?.estimatedSales || 0), 0
      ),
    };
  }

  // Favorites management
  toggleFavorite(opportunityId: string): boolean {
    const favorites = this.getFavorites();
    const isFavorite = favorites.includes(opportunityId);
    
    if (isFavorite) {
      const updated = favorites.filter(id => id !== opportunityId);
      this.saveFavorites(updated);
      this.trackEvent('opportunity_unfavorited', { opportunityId });
      return false;
    } else {
      const updated = [...favorites, opportunityId];
      this.saveFavorites(updated);
      this.trackEvent('opportunity_favorited', { opportunityId });
      return true;
    }
  }

  isFavorite(opportunityId: string): boolean {
    return this.getFavorites().includes(opportunityId);
  }

  private getFavorites(): string[] {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${USER_ID_MOCK}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveFavorites(favorites: string[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${USER_ID_MOCK}`, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }

  // Simulated actions
  async simulateBulkEmail(opportunityId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(1000);
    
    this.trackEvent('action_email_opened', { opportunityId });
    
    return {
      success: true,
      message: 'Modal de email masivo abierto. Backend pendiente de conectar.'
    };
  }

  async simulateBulkWhatsApp(opportunityId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(1000);
    
    this.trackEvent('action_whatsapp_opened', { opportunityId });
    
    return {
      success: true,
      message: 'Modal de WhatsApp masivo abierto. Backend pendiente de conectar.'
    };
  }

  async simulateAssignToSales(opportunityId: string, userId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(800);
    
    this.trackEvent('action_assign_sales', { opportunityId, assignedTo: userId });
    
    return {
      success: true,
      message: `Oportunidad asignada a ${userId} exitosamente (simulado).`
    };
  }

  async simulateLoadCampaign(opportunityId: string): Promise<{ success: boolean; message: string }> {
    await this.delay(1200);
    
    this.trackEvent('campaign_loaded', { opportunityId });
    
    // Remove opportunity from available list (simulate loading to campaigns)
    const index = this.opportunities.findIndex(opp => opp.id === opportunityId);
    if (index > -1) {
      this.opportunities.splice(index, 1);
    }
    
    return {
      success: true,
      message: 'Campaña cargada a Leads exitosamente. La oportunidad ya no aparecerá en la galería.'
    };
  }

  // Analytics simulation
  private trackEvent(event: string, data: any): void {
    console.log(`📊 Analytics Event: ${event}`, data);
    // TODO: Replace with real analytics service
  }

  // Get unique values for filters
  getFilterOptions() {
    const types = [...new Set(this.opportunities.map(opp => opp.type))];
    const priorities = [...new Set(this.opportunities.map(opp => opp.priority))];
    const products = [...new Set(this.opportunities.map(opp => opp.suggestedProduct))];
    const tags = [...new Set(this.opportunities.flatMap(opp => opp.tags))];
    
    return { types, priorities, products, tags };
  }
}

export const opportunitiesService = new OpportunitiesService();