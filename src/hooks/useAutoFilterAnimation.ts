import { useEffect, useRef } from 'react';

interface UseAutoFilterAnimationProps {
  campaignName: string | null;
  onApplyFilter: (campaign: string) => void;
  enabled: boolean;
}

export const useAutoFilterAnimation = ({
  campaignName,
  onApplyFilter,
  enabled,
}: UseAutoFilterAnimationProps) => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!enabled || !campaignName || hasRun.current) {
      return;
    }

    hasRun.current = true;

    const runAnimation = async () => {
      // Step 1: Wait for the page to render (1 second)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Find and click the campaign filter button
      const campaignFilterButton = document.querySelector('[data-filter-field="campaign"]') as HTMLElement;
      if (campaignFilterButton) {
        campaignFilterButton.click();
        
        // Step 3: Wait for popover to open (1 second)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 4: Find the search input and type the campaign name
        const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
        if (searchInput) {
          // Simulate typing with delays between each character
          const chars = campaignName.split('');
          for (let i = 0; i < chars.length; i++) {
            searchInput.value = campaignName.substring(0, i + 1);
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Step 5: Wait a moment before clicking the checkbox (1 second)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Step 6: Find and click the checkbox for the campaign
          const checkboxes = document.querySelectorAll('[role="checkbox"]');
          for (const checkbox of checkboxes) {
            const parent = checkbox.closest('label');
            if (parent && parent.textContent?.includes(campaignName)) {
              (checkbox as HTMLElement).click();
              break;
            }
          }
          
          // Step 7: Wait before clicking Apply (1 second)
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Step 8: Find and click the Apply button
          const applyButton = Array.from(document.querySelectorAll('button')).find(
            btn => btn.textContent?.trim() === 'Aplicar'
          );
          if (applyButton) {
            applyButton.click();
            
            // Call the callback to actually apply the filter
            onApplyFilter(campaignName);
          }
        }
      }
    };

    runAnimation().catch(err => {
      console.error('Error during auto-filter animation:', err);
    });
  }, [campaignName, onApplyFilter, enabled]);
};
