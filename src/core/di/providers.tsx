import { createContext, useContext, ReactNode } from "react";
import type { AdvisorProvider } from "@/features/advisor/services/provider";
import type { CampaignProvider } from "@/features/campaigns/services/provider";
import { AdvisorMockProvider } from "@/features/advisor/services/AdvisorMockProvider";
import { CampaignMockProvider } from "@/features/campaigns/services/CampaignMockProvider";

/**
 * Providers interface - add more providers as needed
 * To switch from Mock to HTTP, just replace the implementation
 */
export interface Providers {
  advisors: AdvisorProvider;
  campaigns: CampaignProvider;
}

const defaultProviders: Providers = {
  advisors: AdvisorMockProvider,
  campaigns: CampaignMockProvider,
};

const ProvidersContext = createContext<Providers>(defaultProviders);

export const useProviders = () => {
  const context = useContext(ProvidersContext);
  if (!context) {
    throw new Error("useProviders must be used within ProvidersRoot");
  }
  return context;
};

interface ProvidersRootProps {
  children: ReactNode;
  providers?: Partial<Providers>;
}

export const ProvidersRoot: React.FC<ProvidersRootProps> = ({
  children,
  providers,
}) => {
  const value: Providers = {
    ...defaultProviders,
    ...providers,
  };

  return (
    <ProvidersContext.Provider value={value}>
      {children}
    </ProvidersContext.Provider>
  );
};
