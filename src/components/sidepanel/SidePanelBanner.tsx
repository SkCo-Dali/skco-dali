
import React from 'react';
import { DynamicBanner } from '../DynamicBanner';

interface SidePanelBannerProps {
  showBanner: boolean;
  onBannerClose: () => void;
  onBannerAction: (automaticReply: string) => void;
}

export const SidePanelBanner: React.FC<SidePanelBannerProps> = ({
  showBanner,
  onBannerClose,
  onBannerAction
}) => {
  if (!showBanner) return null;

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <DynamicBanner 
        onClose={onBannerClose}
        onBannerAction={onBannerAction}
      />
    </div>
  );
};
