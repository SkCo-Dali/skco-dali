import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MarketDaliProvider, useMarketDali } from "@/hooks/useMarketDali";
import { MarketDaliHeader } from "@/components/market-dali/MarketDaliHeader";
import { FiltersBar } from "@/components/market-dali/FiltersBar";
import { OpportunityList } from "@/components/market-dali/OpportunityList";
import { ClientList } from "@/components/market-dali/ClientList";
import { CartDrawer } from "@/components/market-dali/CartDrawer";
import { CartConfirmationModal } from "@/components/market-dali/CartConfirmationModal";
import { CartActionConfirmationModal } from "@/components/market-dali/CartActionConfirmationModal";
import { CartFloatingButton } from "@/components/market-dali/CartFloatingButton";
import { MarketOpportunity, MarketClient } from "@/types/marketDali";
import { Lead } from "@/types/crm";
import { cn } from "@/lib/utils";
import { useChatSamiState } from "@/contexts/ChatSamiContext";
import { useAuth } from "@/contexts/AuthContext";
import { MassEmailSender } from "@/components/MassEmailSender";
import { WhatsAppPropioManager } from "@/components/whatsapp/WhatsAppPropioManager";
import { LoadLeadsProgressModal } from "@/components/LoadLeadsProgressModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";

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

const MarketDaliContent: React.FC = () => {
  const { user } = useAuth();
  const {
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
    showChangeOpportunityModal,
    pendingOpportunity,
    confirmChangeOpportunity,
    cancelChangeOpportunity,
    refreshOpportunities,
  } = useMarketDali();

  const { isChatSamiOpen } = useChatSamiState();
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showClientView, setShowClientView] = useState(false);
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

  // Convert cart items to Lead format for email/whatsapp modals
  const cartLeads = useMemo((): Lead[] => {
    if (!cart.opportunityId) return [];
    return cart.items.map((item) => convertClientToLead(item.client, cart.opportunityId!));
  }, [cart.items, cart.opportunityId]);

  // Filter leads based on selected client IDs
  const selectedLeads = useMemo((): Lead[] => {
    if (selectedClientIds.length === 0) return cartLeads;
    return cartLeads.filter((lead) => selectedClientIds.includes(lead.id));
  }, [cartLeads, selectedClientIds]);

  // Auto-collapse cart when Chat Sami opens
  useEffect(() => {
    if (isChatSamiOpen) {
      setIsCartCollapsed(true);
    }
  }, [isChatSamiOpen]);

  // Handle opportunity selection
  const handleSelectOpportunity = useCallback(
    async (opportunity: MarketOpportunity) => {
      await selectOpportunity(opportunity);
      setShowClientView(true);
    },
    [selectOpportunity],
  );

  // Handle back from client view
  const handleBackToOpportunities = useCallback(() => {
    setShowClientView(false);
  }, []);

  // Check if client is already loaded as a lead
  const isClientAlreadyLoaded = useCallback((client: MarketClient): boolean => {
    return client.alreadyLoaded === true;
  }, []);

  // Add all available clients to cart (excludes already loaded ones)
  const handleAddAllToCart = useCallback(() => {
    clientsOfSelectedOpportunity.forEach((client) => {
      // Skip clients that are already loaded as leads
      if (isClientAlreadyLoaded(client)) return;
      if (!isInCart(client.id)) {
        addToCart(client);
      }
    });
  }, [clientsOfSelectedOpportunity, isInCart, addToCart, isClientAlreadyLoaded]);

  // Cart actions - show confirmation modal for leads
  const handleLoadAsLeadsClick = useCallback(() => {
    if (cart.items.length === 0) return;
    setActionConfirmationType("leads");
  }, [cart.items.length]);

  // Show confirmation before email
  const handleSendEmailClick = useCallback(async () => {
    if (cart.items.length === 0) return;
    setActionConfirmationType("email");
  }, [cart.items.length]);

  // Show confirmation before WhatsApp
  const handleSendWhatsAppClick = useCallback(async () => {
    if (cart.items.length === 0) return;
    setActionConfirmationType("whatsapp");
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
        // Save campaign name before loading (use lastCampaignName for actual campaign filtering)
        const campaignName = cart.lastCampaignName || cart.opportunityTitle || "";
        
        // Start the leads loading process
        setIsLoadLeadsModalOpen(true);
        setLoadLeadsLoading(true);
        setLoadedCampaignName(campaignName);
        setActionConfirmationType(null);
        setIsCartOpen(false);
        
        try {
          // Get leads for selected clients only
          const leadsToLoad = cartLeads.filter(lead => clientIds.includes(lead.id));
          // Pass selected client IDs to only load those specific clients
          await loadCartAsLeads(clientIds);
          setLoadedLeads(leadsToLoad);
        } finally {
          setLoadLeadsLoading(false);
        }
        return;
      }
      setActionConfirmationType(null);
      setIsCartOpen(false); // Close cart on mobile
    },
    [actionConfirmationType, cart.lastCampaignName, cart.opportunityTitle, cartLeads, loadCartAsLeads],
  );

  // Cancel action confirmation
  const handleActionCancel = useCallback(() => {
    setActionConfirmationType(null);
  }, []);

  // Add more clients (close confirmation, go back to client view if not there)
  const handleAddMoreClients = useCallback(() => {
    setActionConfirmationType(null);
    // If we're in opportunities view and there's a selected opportunity, go to client view
    if (!showClientView && selectedOpportunity) {
      setShowClientView(true);
    }
  }, [showClientView, selectedOpportunity]);

  // Close email modal
  const handleCloseEmailModal = useCallback(() => {
    setIsEmailModalOpen(false);
  }, []);

  // Close WhatsApp modal
  const handleCloseWhatsAppModal = useCallback(() => {
    setIsWhatsAppModalOpen(false);
  }, []);

  // Handle actions from LoadLeadsProgressModal
  const handleSendEmailsFromProgress = useCallback(() => {
    setIsLoadLeadsModalOpen(false);
    setActionConfirmationType("email");
  }, []);

  const handleGoToLeads = useCallback(() => {
    setIsLoadLeadsModalOpen(false);
    // Navigate to leads page with campaign filter applied using autoFilterCampaign
    const campaignFilter = encodeURIComponent(loadedCampaignName);
    navigate(`/leads?autoFilterCampaign=${campaignFilter}`);
  }, [loadedCampaignName, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Main content area */}
      <div
        className={cn(
          "transition-all duration-300",
          isCartCollapsed ? "lg:pr-12" : "lg:pr-[22rem]", // Space for button when collapsed, cart panel + gap when expanded
        )}
      >
        <div className="p-4 sm:p-6 max-w-full mx-auto">
          {/* Header */}
          <MarketDaliHeader
            onRefresh={refreshOpportunities}
            isLoading={isLoadingOpportunities}
            showBackButton={showClientView}
            onBack={handleBackToOpportunities}
          />

          {/* Filters - only show when viewing opportunities */}
          {!showClientView && (
            <FiltersBar filters={filters} onFiltersChange={setFilters} onResetFilters={resetFilters} />
          )}

          {/* Content */}
          {showClientView && selectedOpportunity ? (
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
          ) : (
            <OpportunityList
              opportunities={opportunities}
              selectedOpportunity={selectedOpportunity}
              filters={filters}
              isLoading={isLoadingOpportunities}
              onSelectOpportunity={handleSelectOpportunity}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </div>
      </div>

      {/* Floating cart button (mobile) */}
      <CartFloatingButton itemsCount={cart.items.length} onClick={() => setIsCartOpen(true)} />

      {/* Cart drawer (desktop: always visible, mobile: overlay) */}
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

      {/* Action confirmation modal (before email/whatsapp) */}
      <CartActionConfirmationModal
        isOpen={actionConfirmationType !== null}
        actionType={actionConfirmationType}
        items={cart.items}
        opportunityTitle={cart.opportunityTitle}
        onConfirm={handleActionConfirm}
        onCancel={handleActionCancel}
        onAddMore={handleAddMoreClients}
      />

      {/* Email sender modal - floating dialog */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto p-0">
          <button
            onClick={handleCloseEmailModal}
            className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <span className="sr-only">Cerrar</span>
          </button>
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

// Wrapped page component with provider
const MarketDaliPage: React.FC = () => {
  return (
    <MarketDaliProvider>
      <MarketDaliContent />
    </MarketDaliProvider>
  );
};

export default MarketDaliPage;
