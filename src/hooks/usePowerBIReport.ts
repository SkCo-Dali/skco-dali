import { useEffect, useRef, useState } from 'react';
import * as powerbi from 'powerbi-client';
import { models, service, IEmbedConfiguration } from 'powerbi-client';
import { fetchEmbedInfo, auditReportEvent } from '@/services/powerbiApiService';

type PowerBIStatus = 'idle' | 'loading' | 'ready' | 'error' | 'no-access' | 'expired';

interface UsePowerBIReportOptions {
  reportId: string;
  workspaceId: string;
  token: string;
  onError?: (error: any) => void;
}

export function usePowerBIReport(options: UsePowerBIReportOptions) {
  const { reportId, workspaceId, token, onError } = options;
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<PowerBIStatus>('idle');
  const [error, setError] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const expireTimer = useRef<number | undefined>(undefined);
  const powerbiService = useRef<any>(null);

  const initializePowerBI = async () => {
    try {
      setStatus('loading');
      setError(null);

      // 1. Fetch embed information
      const embedInfo = await fetchEmbedInfo({ reportId, workspaceId }, token);

      // 2. Configure embed settings
      const config: IEmbedConfiguration = {
        type: 'report',
        id: reportId,
        embedUrl: embedInfo.embedUrl,
        accessToken: embedInfo.embedToken,
        tokenType: powerbi.models.TokenType.Embed,
        settings: {
          panes: {
            filters: { visible: false },
            pageNavigation: { visible: false }
          },
          bars: {
            statusBar: { visible: false }
          },
          visualRenderedEvents: true,
          layoutType: models.LayoutType.Custom,
          customLayout: {
            displayOption: models.DisplayOption.FitToPage
          }
        },
      };

      // 3. Initialize Power BI service if not already done
      if (!powerbiService.current) {
        powerbiService.current = new powerbi.service.Service(
          powerbi.factories.hpmFactory,
          powerbi.factories.wpmpFactory,
          powerbi.factories.routerFactory
        );
      }

      // 4. Ensure container is ready
      if (!containerRef.current) {
        throw new Error('Container reference not ready');
      }

      // 5. Reset any existing embeds and embed the report
      powerbiService.current.reset(containerRef.current);
      const embeddedReport = powerbiService.current.embed(containerRef.current, config);
      setReport(embeddedReport);

      // 6. Set up event handlers
      embeddedReport.on('loaded', async () => {
        console.log('Power BI report loaded successfully');
        setStatus('ready');
        
        // Log audit event for viewing the report
        try {
          await auditReportEvent(token, reportId, 'view');
        } catch (auditError) {
          console.warn('Failed to log view event:', auditError);
        }
      });

      embeddedReport.on('rendered', () => {
        console.log('Power BI report rendered successfully');
      });

      embeddedReport.on('pageChanged', async (event: any) => {
        console.log('Power BI page changed:', event);
        const newPage = event?.detail?.newPage;
        const pageName = newPage?.displayName || newPage?.name || 'Unknown Page';
        
        try {
          await auditReportEvent(token, reportId, 'page_change', { 
            page: pageName,
            pageId: newPage?.name
          });
        } catch (auditError) {
          console.warn('Failed to log page change event:', auditError);
        }
      });

      embeddedReport.on('error', (event: any) => {
        console.error('Power BI embed error:', event);
        const errorDetails = event?.detail;
        setError(errorDetails || event);
        setStatus('error');
        onError?.(errorDetails || event);
      });

      // 7. Set up token refresh timer (45 minutes)
      window.clearTimeout(expireTimer.current);
      expireTimer.current = window.setTimeout(() => {
        console.warn('Power BI embed token approaching expiration');
        setStatus('expired');
      }, 45 * 60 * 1000); // 45 minutes

    } catch (err) {
      console.error('Failed to initialize Power BI embed:', err);
      setError(err);
      setStatus('error');
      onError?.(err);
    }
  };

  // Refresh the report data
  const refreshReport = async () => {
    if (report && status === 'ready') {
      try {
        await report.refresh();
        await auditReportEvent(token, reportId, 'refresh');
      } catch (err) {
        console.error('Failed to refresh report:', err);
        onError?.(err);
      }
    }
  };

  // Handle fullscreen
  const toggleFullscreen = async () => {
    try {
      if (containerRef.current) {
        if (!document.fullscreenElement) {
          await containerRef.current.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
        await auditReportEvent(token, reportId, 'fullscreen');
      }
    } catch (err) {
      console.error('Failed to toggle fullscreen:', err);
      onError?.(err);
    }
  };

  // Handle export
  const exportReport = async () => {
    try {
      await auditReportEvent(token, reportId, 'export');
      // Note: Actual export functionality would require additional Power BI API calls
      console.log('Export functionality would be implemented here');
    } catch (err) {
      console.error('Failed to export report:', err);
      onError?.(err);
    }
  };

  // Initialize on mount and when key props change
  useEffect(() => {
    if (reportId && workspaceId && token) {
      initializePowerBI();
    }

    // Cleanup on unmount or prop changes
    return () => {
      window.clearTimeout(expireTimer.current);
      if (report) {
        try {
          report.off('loaded');
          report.off('rendered');
          report.off('pageChanged');
          report.off('error');
        } catch (err) {
          console.warn('Error cleaning up Power BI event listeners:', err);
        }
      }
    };
  }, [reportId, workspaceId, token]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (powerbiService.current && containerRef.current) {
        try {
          powerbiService.current.reset(containerRef.current);
        } catch (err) {
          console.warn('Error resetting Power BI service:', err);
        }
      }
    };
  }, []);

  return {
    containerRef,
    status,
    error,
    report,
    refreshReport,
    toggleFullscreen,
    exportReport,
    reinitialize: initializePowerBI
  };
}