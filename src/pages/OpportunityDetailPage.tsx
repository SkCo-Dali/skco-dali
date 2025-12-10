import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MarketDaliProvider, useMarketDali } from "@/hooks/useMarketDali";
import { MarketDaliHeader } from "@/components/market-dali/MarketDaliHeader";
import { ClientList } from "@/components/market-dali/ClientList";
import { CartDrawer } from "@/components/market-dali/CartDrawer";
import { CartConfirmationModal } from "@/components/market-dali/CartConfirmationModal";
import { CartActionConfirmationModal } from "@/components/market-dali/CartActionConfirmationModal";
import { CartFloatingButton } from "@/components/market-dali/CartFloatingButton";
import { MarketClient } from "@/types/marketDali";
import { Lead } from "@/types/crm";
import { cn } from "@/lib/utils";
import { useChatSamiState } from "@/contexts/ChatSamiContext";
import { useAuth } from "@/contexts/AuthContext";
import { MassEmailSender } from "@/components/MassEmailSender";
import { WhatsAppPropioManager } from "@/components/whatsapp/WhatsAppPropioManager";
import { LoadLeadsProgressModal } from "@/components/LoadLeadsProgressModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Home, Store } from "lucide-react";

// Breadcrumbs component
const Breadcrumbs: React.FC<{ opportunityTitle?: string }> = ({ opportunityTitle }) => {
  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      {/* <Link 
        to="/dashboard" 
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>
      <ChevronRight className="h-4 w-4" />*/}
      <Link to="/market-dali" className="flex items-center gap-1 hover:text-foreground transition-colors">
        <Store className="h-4 w-4" />
        <span>Oportunidades</span>
      </Link>
      {opportunityTitle && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">{opportunityTitle}</span>
        </>
      )}
    </nav>
  );
};

// Helper function to convert MarketClient to Lead format
const convertClientToLead = (client: MarketClient, opportunityId: string): Lead => ({
  id: client.id,
  name: client.name,
  email: client.email,
  phone: client.phone,
  status: "New",
  source: "DaliLM",
  priority: "Medium",
  campaign: opportunityId,
  portfolio: "",
  product: client.currentProduct || "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stage: "Nuevo",
  assignedTo: "",
  createdBy: "",
  company: "",
  occupation: "",
  value: 0,
  documentType: client.documentType,
  documentNumber: client.documentNumber,
  age: client.age,
  gender: client.gender,
  preferredContactChannel: "",
  portfolios: [],
  tags: [],
});

const OpportunityDetailContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isChatSamiOpen } = useChatSamiState();

  const {
    opportunities,
    selectedOpportunity,
    clientsOfSelectedOpportunity,
    cart,
    isLoadingOpportunities,
    isLoadingClients,
    isProcessingAction,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    selectOpportunity,
    loadCartAsLeads,
    showChangeOpportunityModal,
    pendingOpportunity,
    confirmChangeOpportunity,
    cancelChangeOpportunity,
  } = useMarketDali();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartCollapsed, setIsCartCollapsed] = useState(true);

  // Action confirmation modal state
  const [actionConfirmationType, setActionConfirmationType] = useState<"email" | "whatsapp" | "leads" | null>(null);

  // Email/WhatsApp/LoadLeads modals state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isLoadLeadsModalOpen, setIsLoadLeadsModalOpen] = useState(false);
  const [loadLeadsLoading, setLoadLeadsLoading] = useState(false);
  const [loadedLeads, setLoadedLeads] = useState<Lead[]>([]);
  const [loadedCampaignName, setLoadedCampaignName] = useState("");

  // Selected client IDs from confirmation modal
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  // Auto-select opportunity when opportunities load and id is available
  useEffect(() => {
    if (id && opportunities.length > 0 && !selectedOpportunity) {
      const opportunity = opportunities.find((opp) => opp.id === id);
      if (opportunity) {
        selectOpportunity(opportunity);
      }
    }
  }, [id, opportunities, selectedOpportunity, selectOpportunity]);

  // Auto-collapse cart when Chat Sami opens
  useEffect(() => {
    if (isChatSamiOpen) {
      setIsCartCollapsed(true);
    }
  }, [isChatSamiOpen]);

  // Convert cart items to Lead format
  const cartLeads = useMemo((): Lead[] => {
    if (!cart.opportunityId) return [];
    return cart.items.map((item) => convertClientToLead(item.client, cart.opportunityId!));
  }, [cart.items, cart.opportunityId]);

  // Filter leads based on selected client IDs
  const selectedLeads = useMemo((): Lead[] => {
    if (selectedClientIds.length === 0) return cartLeads;
    return cartLeads.filter((lead) => selectedClientIds.includes(lead.id));
  }, [cartLeads, selectedClientIds]);

  // Handle back to opportunities list
  const handleBackToOpportunities = useCallback(() => {
    navigate("/market-dali");
  }, [navigate]);

  // Check if client is already loaded as a lead
  const isClientAlreadyLoaded = useCallback((client: MarketClient): boolean => {
    return client.id !== null && !client.id.startsWith("temp-");
  }, []);

  // Add all available clients to cart
  const handleAddAllToCart = useCallback(() => {
    clientsOfSelectedOpportunity.forEach((client) => {
      if (isClientAlreadyLoaded(client)) return;
      if (!isInCart(client.id)) {
        addToCart(client);
      }
    });
  }, [clientsOfSelectedOpportunity, isInCart, addToCart, isClientAlreadyLoaded]);

  // Cart actions
  const handleLoadAsLeadsClick = useCallback(() => {
    if (cart.items.length === 0) return;
    setActionConfirmationType("leads");
  }, [cart.items.length]);

  // Confirm action and open respective modal
  const handleActionConfirm = useCallback(
    async (clientIds: string[]) => {
      setSelectedClientIds(clientIds);
      if (actionConfirmationType === "email") {
        setIsEmailModalOpen(true);
      } else if (actionConfirmationType === "whatsapp") {
        setIsWhatsAppModalOpen(true);
      } else if (actionConfirmationType === "leads") {
        const campaignName = cart.lastCampaignName || cart.opportunityTitle || "";
        setIsLoadLeadsModalOpen(true);
        setLoadLeadsLoading(true);
        setLoadedCampaignName(campaignName);
        setActionConfirmationType(null);
        setIsCartOpen(false);

        try {
          const leadsToLoad = cartLeads.filter((lead) => clientIds.includes(lead.id));
          await loadCartAsLeads(clientIds);
          setLoadedLeads(leadsToLoad);
        } finally {
          setLoadLeadsLoading(false);
        }
        return;
      }
      setActionConfirmationType(null);
      setIsCartOpen(false);
    },
    [actionConfirmationType, cart.lastCampaignName, cart.opportunityTitle, cartLeads, loadCartAsLeads],
  );

  const handleActionCancel = useCallback(() => {
    setActionConfirmationType(null);
  }, []);

  const handleAddMoreClients = useCallback(() => {
    setActionConfirmationType(null);
  }, []);

  const handleCloseEmailModal = useCallback(() => {
    setIsEmailModalOpen(false);
  }, []);

  const handleCloseWhatsAppModal = useCallback(() => {
    setIsWhatsAppModalOpen(false);
  }, []);

  const handleSendEmailsFromProgress = useCallback(() => {
    setIsLoadLeadsModalOpen(false);
    setActionConfirmationType("email");
  }, []);

  const handleGoToLeads = useCallback(() => {
    setIsLoadLeadsModalOpen(false);
    const campaignFilter = encodeURIComponent(loadedCampaignName);
    navigate(`/leads?autoFilterCampaign=${campaignFilter}`);
  }, [loadedCampaignName, navigate]);

  // Loading state
  if (isLoadingOpportunities || (!selectedOpportunity && opportunities.length === 0)) {
    return (
      <div className="min-h-screen bg-background p-4 sm:p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-40 w-full mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Opportunity not found
  if (!selectedOpportunity && opportunities.length > 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Oportunidad no encontrada</h2>
          <p className="text-muted-foreground mb-4">La oportunidad que buscas no existe o ha sido eliminada.</p>
          <button onClick={handleBackToOpportunities} className="text-primary hover:underline">
            Volver a oportunidades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className={cn("transition-all duration-300", isCartCollapsed ? "lg:pr-12" : "lg:pr-[22rem]")}>
        <div className="p-4 sm:p-6 max-w-full mx-auto">
          <Breadcrumbs opportunityTitle={selectedOpportunity?.title} />

          <MarketDaliHeader
            onRefresh={() => {}}
            isLoading={isLoadingClients}
            showBackButton={true}
            onBack={handleBackToOpportunities}
          />

          {selectedOpportunity && (
            <ClientList
              opportunity={selectedOpportunity}
              clients={clientsOfSelectedOpportunity}
              isLoading={isLoadingClients}
              isInCart={isInCart}
              cartItemsCount={cart.items.length}
              onAddToCart={addToCart}
              onRemoveFromCart={removeFromCart}
              onBack={handleBackToOpportunities}
              onAddAllToCart={handleAddAllToCart}
            />
          )}
        </div>
      </div>

      {/* Floating cart button (mobile) */}
      <CartFloatingButton itemsCount={cart.items.length} onClick={() => setIsCartOpen(true)} />

      {/* Cart drawer (desktop) */}
      <div className="hidden lg:block">
        <CartDrawer
          cart={cart}
          isOpen={true}
          isProcessing={isProcessingAction}
          isCollapsed={isCartCollapsed}
          onCollapsedChange={setIsCartCollapsed}
          onClose={() => {}}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onLoadAsLeads={handleLoadAsLeadsClick}
        />
      </div>

      {/* Mobile cart drawer */}
      <div className="lg:hidden">
        <CartDrawer
          cart={cart}
          isOpen={isCartOpen}
          isProcessing={isProcessingAction}
          onClose={() => setIsCartOpen(false)}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onLoadAsLeads={handleLoadAsLeadsClick}
        />
      </div>

      {/* Change opportunity confirmation modal */}
      <CartConfirmationModal
        isOpen={showChangeOpportunityModal}
        currentOpportunityTitle={cart.opportunityTitle}
        newOpportunityTitle={pendingOpportunity?.title || ""}
        onConfirm={confirmChangeOpportunity}
        onCancel={cancelChangeOpportunity}
      />

      {/* Action confirmation modal */}
      <CartActionConfirmationModal
        isOpen={actionConfirmationType !== null}
        actionType={actionConfirmationType}
        items={cart.items}
        opportunityTitle={cart.opportunityTitle}
        onConfirm={handleActionConfirm}
        onCancel={handleActionCancel}
        onAddMore={handleAddMoreClients}
      />

      {/* Email sender modal */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto p-0">
          <div className="p-4">
            <MassEmailSender
              filteredLeads={selectedLeads}
              onClose={handleCloseEmailModal}
              opportunityId={cart.opportunityId ? parseInt(cart.opportunityId, 10) : undefined}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp sender modal */}
      {isWhatsAppModalOpen && (
        <WhatsAppPropioManager
          leads={selectedLeads}
          isOpen={isWhatsAppModalOpen}
          onClose={handleCloseWhatsAppModal}
          userEmail={user?.email || ""}
        />
      )}

      {/* Load Leads Progress Modal */}
      <LoadLeadsProgressModal
        open={isLoadLeadsModalOpen}
        loading={loadLeadsLoading}
        leads={loadedLeads}
        campaignName={loadedCampaignName}
        onSendEmails={handleSendEmailsFromProgress}
        onGoToLeads={handleGoToLeads}
      />
    </div>
  );
};

const OpportunityDetailPage: React.FC = () => {
  return (
    <MarketDaliProvider>
      <OpportunityDetailContent />
    </MarketDaliProvider>
  );
};

export default OpportunityDetailPage;
