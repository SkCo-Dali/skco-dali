import React, { useState, useCallback } from 'react';
import { MarketDaliProvider, useMarketDali } from '@/hooks/useMarketDali';
import { MarketDaliHeader } from '@/components/market-dali/MarketDaliHeader';
import { FiltersBar } from '@/components/market-dali/FiltersBar';
import { OpportunityList } from '@/components/market-dali/OpportunityList';
import { ClientList } from '@/components/market-dali/ClientList';
import { CartDrawer } from '@/components/market-dali/CartDrawer';
import { CartConfirmationModal } from '@/components/market-dali/CartConfirmationModal';
import { CartFloatingButton } from '@/components/market-dali/CartFloatingButton';
import { MarketOpportunity } from '@/types/marketDali';
import { cn } from '@/lib/utils';

const MarketDaliContent: React.FC = () => {
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
    sendCartEmail,
    sendCartWhatsApp,
    showChangeOpportunityModal,
    pendingOpportunity,
    confirmChangeOpportunity,
    cancelChangeOpportunity,
    refreshOpportunities,
  } = useMarketDali();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showClientView, setShowClientView] = useState(false);

  // Handle opportunity selection
  const handleSelectOpportunity = useCallback(async (opportunity: MarketOpportunity) => {
    await selectOpportunity(opportunity);
    setShowClientView(true);
  }, [selectOpportunity]);

  // Handle back from client view
  const handleBackToOpportunities = useCallback(() => {
    setShowClientView(false);
  }, []);

  // Add all clients to cart
  const handleAddAllToCart = useCallback(() => {
    clientsOfSelectedOpportunity.forEach(client => {
      if (!isInCart(client.id)) {
        addToCart(client);
      }
    });
  }, [clientsOfSelectedOpportunity, isInCart, addToCart]);

  // Cart actions
  const handleLoadAsLeads = useCallback(async () => {
    await loadCartAsLeads();
    setIsCartOpen(false);
  }, [loadCartAsLeads]);

  const handleSendEmail = useCallback(async () => {
    await sendCartEmail();
  }, [sendCartEmail]);

  const handleSendWhatsApp = useCallback(async () => {
    await sendCartWhatsApp();
  }, [sendCartWhatsApp]);

  return (
    <div className="min-h-screen bg-background">
      {/* Main content area */}
      <div className={cn(
        'transition-all duration-300',
        'lg:pr-80' // Space for cart panel on desktop
      )}>
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header */}
          <MarketDaliHeader 
            onRefresh={refreshOpportunities}
            isLoading={isLoadingOpportunities}
          />

          {/* Filters - only show when viewing opportunities */}
          {!showClientView && (
            <FiltersBar
              filters={filters}
              onFiltersChange={setFilters}
              onResetFilters={resetFilters}
            />
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
      <CartFloatingButton
        itemsCount={cart.items.length}
        onClick={() => setIsCartOpen(true)}
      />

      {/* Cart drawer (desktop: always visible, mobile: overlay) */}
      <div className="hidden lg:block">
        <CartDrawer
          cart={cart}
          isOpen={true}
          isProcessing={isProcessingAction}
          onClose={() => {}}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onLoadAsLeads={handleLoadAsLeads}
          onSendEmail={handleSendEmail}
          onSendWhatsApp={handleSendWhatsApp}
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
          onLoadAsLeads={handleLoadAsLeads}
          onSendEmail={handleSendEmail}
          onSendWhatsApp={handleSendWhatsApp}
        />
      </div>

      {/* Change opportunity confirmation modal */}
      <CartConfirmationModal
        isOpen={showChangeOpportunityModal}
        currentOpportunityTitle={cart.opportunityTitle}
        newOpportunityTitle={pendingOpportunity?.title || ''}
        onConfirm={confirmChangeOpportunity}
        onCancel={cancelChangeOpportunity}
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
