import React, { createContext, useContext, useReducer, useCallback, useState, useEffect } from 'react';
import { 
  MarketOpportunity, 
  MarketClient, 
  MarketCart, 
  CartItem, 
  MarketFilters,
  CartAction 
} from '@/types/marketDali';
import * as marketDaliApi from '@/services/marketDaliApi';
import { useToast } from '@/hooks/use-toast';

// ============ CART REDUCER ============
const cartReducer = (state: MarketCart, action: CartAction): MarketCart => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem: CartItem = {
        client: action.payload.client,
        opportunityId: action.payload.opportunityId,
        addedAt: new Date(),
      };
      return {
        opportunityId: action.payload.opportunityId,
        opportunityTitle: action.payload.opportunityTitle,
        lastCampaignName: action.payload.lastCampaignName,
        items: [...state.items, newItem],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.client.id !== action.payload.clientId),
      };
    case 'CLEAR_CART':
      return {
        opportunityId: null,
        opportunityTitle: null,
        lastCampaignName: null,
        items: [],
      };
    case 'SET_OPPORTUNITY':
      return {
        opportunityId: action.payload.opportunityId,
        opportunityTitle: action.payload.opportunityTitle,
        lastCampaignName: action.payload.lastCampaignName,
        items: [],
      };
    default:
      return state;
  }
};

// ============ CONTEXT TYPES ============
interface MarketDaliContextType {
  // Data
  opportunities: MarketOpportunity[];
  selectedOpportunity: MarketOpportunity | null;
  clientsOfSelectedOpportunity: MarketClient[];
  cart: MarketCart;
  filters: MarketFilters;
  
  // Loading states
  isLoadingOpportunities: boolean;
  isLoadingClients: boolean;
  isProcessingAction: boolean;
  
  // Cart actions
  addToCart: (client: MarketClient) => boolean;
  removeFromCart: (clientId: string) => void;
  clearCart: () => void;
  isInCart: (clientId: string) => boolean;
  
  // Opportunity actions
  selectOpportunity: (opportunity: MarketOpportunity) => Promise<void>;
  toggleFavorite: (opportunityId: string) => Promise<void>;
  
  // Filter actions
  setFilters: (filters: Partial<MarketFilters>) => void;
  resetFilters: () => void;
  
  // Bulk actions
  loadCartAsLeads: (selectedClientIds?: string[]) => Promise<boolean>;
  sendCartEmail: () => Promise<boolean>;
  sendCartWhatsApp: () => Promise<boolean>;
  
  // Confirmation modal state
  showChangeOpportunityModal: boolean;
  pendingClient: MarketClient | null;
  pendingOpportunity: MarketOpportunity | null;
  confirmChangeOpportunity: () => void;
  cancelChangeOpportunity: () => void;
  
  // Refresh data
  refreshOpportunities: () => Promise<void>;
}

const defaultFilters: MarketFilters = {
  search: '',
  categories: [],
  priorities: [],
  minClients: 0,
  maxClients: 100000,
  minCommission: 0,
  maxCommission: 10000000,
  onlyFavorites: false,
};

const CART_STORAGE_KEY = 'market-dali-cart';

const getInitialCart = (): MarketCart => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Restore Date objects for addedAt
      if (parsed.items) {
        parsed.items = parsed.items.map((item: CartItem) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
      }
      return parsed;
    }
  } catch (error) {
    console.warn('Error loading cart from localStorage:', error);
  }
  return {
    opportunityId: null,
    opportunityTitle: null,
    lastCampaignName: null,
    items: [],
  };
};

// ============ CONTEXT ============
const MarketDaliContext = createContext<MarketDaliContextType | null>(null);

// ============ PROVIDER ============
export const MarketDaliProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // State
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<MarketOpportunity | null>(null);
  const [clientsOfSelectedOpportunity, setClientsOfSelectedOpportunity] = useState<MarketClient[]>([]);
  const [cart, dispatchCart] = useReducer(cartReducer, null, getInitialCart);
  const [filters, setFiltersState] = useState<MarketFilters>(defaultFilters);
  
  // Loading states
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(false);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  
  // Modal state for opportunity change confirmation
  const [showChangeOpportunityModal, setShowChangeOpportunityModal] = useState(false);
  const [pendingClient, setPendingClient] = useState<MarketClient | null>(null);
  const [pendingOpportunity, setPendingOpportunity] = useState<MarketOpportunity | null>(null);

  // ============ FETCH OPPORTUNITIES ============
  const refreshOpportunities = useCallback(async () => {
    setIsLoadingOpportunities(true);
    try {
      console.log('🔄 Market Dali: Fetching opportunities...');
      const data = await marketDaliApi.fetchOpportunities();
      console.log('✅ Market Dali: Opportunities fetched:', data.length, data);
      setOpportunities(data);
    } catch (error) {
      console.error('❌ Market Dali: Error fetching opportunities:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las oportunidades',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingOpportunities(false);
    }
  }, [toast]);

  // Load opportunities on mount
  useEffect(() => {
    refreshOpportunities();
  }, [refreshOpportunities]);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // ============ SELECT OPPORTUNITY ============
  const selectOpportunity = useCallback(async (opportunity: MarketOpportunity) => {
    setSelectedOpportunity(opportunity);
    setIsLoadingClients(true);
    
    try {
      const clients = await marketDaliApi.fetchClientsForOpportunity(opportunity.id);
      setClientsOfSelectedOpportunity(clients);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes de esta oportunidad',
        variant: 'destructive',
      });
      setClientsOfSelectedOpportunity([]);
    } finally {
      setIsLoadingClients(false);
    }
  }, [toast]);

  // ============ CART OPERATIONS ============
  const isInCart = useCallback((clientId: string): boolean => {
    return cart.items.some(item => item.client.id === clientId);
  }, [cart.items]);

  const addToCart = useCallback((client: MarketClient): boolean => {
    if (!selectedOpportunity) return false;
    
    // Check if client is already in cart
    if (isInCart(client.id)) {
      toast({
        title: 'Cliente ya agregado',
        description: 'Este cliente ya está en tu carrito',
      });
      return false;
    }
    
    // Check if cart belongs to a different opportunity
    if (cart.opportunityId && cart.opportunityId !== selectedOpportunity.id) {
      // Show confirmation modal
      setPendingClient(client);
      setPendingOpportunity(selectedOpportunity);
      setShowChangeOpportunityModal(true);
      return false;
    }
    
    // Add to cart
    dispatchCart({
      type: 'ADD_ITEM',
      payload: {
        client,
        opportunityId: selectedOpportunity.id,
        opportunityTitle: selectedOpportunity.title,
        lastCampaignName: selectedOpportunity.lastCampaignName || null,
      },
    });
    
    return true;
  }, [selectedOpportunity, cart.opportunityId, isInCart, toast]);

  const removeFromCart = useCallback((clientId: string) => {
    dispatchCart({ type: 'REMOVE_ITEM', payload: { clientId } });
  }, []);

  const clearCart = useCallback(() => {
    dispatchCart({ type: 'CLEAR_CART' });
  }, []);

  // ============ CHANGE OPPORTUNITY CONFIRMATION ============
  const confirmChangeOpportunity = useCallback(() => {
    if (pendingClient && pendingOpportunity) {
      // Clear cart and add new client
      dispatchCart({ type: 'CLEAR_CART' });
      dispatchCart({
        type: 'ADD_ITEM',
        payload: {
          client: pendingClient,
          opportunityId: pendingOpportunity.id,
          opportunityTitle: pendingOpportunity.title,
          lastCampaignName: pendingOpportunity.lastCampaignName || null,
        },
      });
      
      toast({
        title: 'Carrito actualizado',
        description: `Ahora tu carrito pertenece a "${pendingOpportunity.title}"`,
      });
    }
    
    setShowChangeOpportunityModal(false);
    setPendingClient(null);
    setPendingOpportunity(null);
  }, [pendingClient, pendingOpportunity, toast]);

  const cancelChangeOpportunity = useCallback(() => {
    setShowChangeOpportunityModal(false);
    setPendingClient(null);
    setPendingOpportunity(null);
  }, []);

  // ============ FAVORITE TOGGLE ============
  const toggleFavorite = useCallback(async (opportunityId: string) => {
    const opp = opportunities.find(o => o.id === opportunityId);
    if (!opp) return;
    
    try {
      await marketDaliApi.toggleOpportunityFavorite(opportunityId, !opp.isFavorite);
      setOpportunities(prev => 
        prev.map(o => o.id === opportunityId ? { ...o, isFavorite: !o.isFavorite } : o)
      );
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el favorito',
        variant: 'destructive',
      });
    }
  }, [opportunities, toast]);

  // ============ FILTERS ============
  const setFilters = useCallback((newFilters: Partial<MarketFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  // ============ BULK ACTIONS ============
  const loadCartAsLeads = useCallback(async (selectedClientIds?: string[]): Promise<boolean> => {
    if (!cart.opportunityId || cart.items.length === 0) return false;
    
    setIsProcessingAction(true);
    try {
      // Get clients with documentNumber and documentType for selected clients
      let clientsToLoad: Array<{ documentNumber: number; documentType: string }> = [];
      if (selectedClientIds && selectedClientIds.length > 0) {
        clientsToLoad = cart.items
          .filter(item => selectedClientIds.includes(item.client.id))
          .map(item => ({
            documentNumber: item.client.documentNumber,
            documentType: item.client.documentType,
          }))
          .filter(c => c.documentNumber !== undefined && c.documentNumber !== null);
      } else {
        // If no specific selection, load all items in cart
        clientsToLoad = cart.items
          .map(item => ({
            documentNumber: item.client.documentNumber,
            documentType: item.client.documentType,
          }))
          .filter(c => c.documentNumber !== undefined && c.documentNumber !== null);
      }
      
      const result = await marketDaliApi.loadClientsAsLeads(cart.opportunityId, clientsToLoad);
      if (result.success) {
        const loadedCount = selectedClientIds?.length || cart.items.length;
        toast({
          title: '¡Clientes cargados!',
          description: `${loadedCount} clientes agregados al gestor de leads`,
        });
        clearCart();
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes como leads',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessingAction(false);
    }
  }, [cart, toast, clearCart]);

  const sendCartEmail = useCallback(async (): Promise<boolean> => {
    if (!cart.opportunityId || cart.items.length === 0) return false;
    
    setIsProcessingAction(true);
    try {
      const clientIds = cart.items.map(item => item.client.id);
      const result = await marketDaliApi.sendBulkEmail(clientIds, cart.opportunityId);
      if (result.success) {
        toast({
          title: '¡Correos enviados!',
          description: `Se enviaron correos a ${cart.items.length} clientes`,
        });
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron enviar los correos',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessingAction(false);
    }
  }, [cart, toast]);

  const sendCartWhatsApp = useCallback(async (): Promise<boolean> => {
    if (!cart.opportunityId || cart.items.length === 0) return false;
    
    setIsProcessingAction(true);
    try {
      const clientIds = cart.items.map(item => item.client.id);
      const result = await marketDaliApi.sendBulkWhatsApp(clientIds, cart.opportunityId);
      if (result.success) {
        toast({
          title: '¡WhatsApp enviados!',
          description: `Se enviaron mensajes a ${cart.items.length} clientes`,
        });
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron enviar los mensajes',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessingAction(false);
    }
  }, [cart, toast]);

  const value: MarketDaliContextType = {
    opportunities,
    selectedOpportunity,
    clientsOfSelectedOpportunity,
    cart,
    filters,
    isLoadingOpportunities,
    isLoadingClients,
    isProcessingAction,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    selectOpportunity,
    toggleFavorite,
    setFilters,
    resetFilters,
    loadCartAsLeads,
    sendCartEmail,
    sendCartWhatsApp,
    showChangeOpportunityModal,
    pendingClient,
    pendingOpportunity,
    confirmChangeOpportunity,
    cancelChangeOpportunity,
    refreshOpportunities,
  };

  return (
    <MarketDaliContext.Provider value={value}>
      {children}
    </MarketDaliContext.Provider>
  );
};

// ============ HOOK ============
export const useMarketDali = (): MarketDaliContextType => {
  const context = useContext(MarketDaliContext);
  if (!context) {
    throw new Error('useMarketDali must be used within a MarketDaliProvider');
  }
  return context;
};
