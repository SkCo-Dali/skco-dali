import { useState, useEffect, useCallback } from "react";
import { DashboardLayout, DEFAULT_WIDGETS, WidgetConfig } from "@/types/dashboard";

const STORAGE_KEY = "dashboard-layout";

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayout>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing dashboard layout:", e);
      }
    }
    return {
      widgets: DEFAULT_WIDGETS,
      columns: 4,
    };
  });

  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  const updateWidget = useCallback((widgetId: string, updates: Partial<WidgetConfig>) => {
    setLayout((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === widgetId ? { ...w, ...updates } : w)),
    }));
  }, []);

  const reorderWidgets = useCallback((newOrder: string[]) => {
    setLayout((prev) => {
      const widgetMap = new Map(prev.widgets.map((w) => [w.id, w]));
      const reordered = newOrder
        .map((id, index) => {
          const widget = widgetMap.get(id);
          return widget ? { ...widget, position: index } : null;
        })
        .filter((w): w is WidgetConfig => w !== null);

      return { ...prev, widgets: reordered };
    });
  }, []);

  const toggleWidget = useCallback((widgetId: string) => {
    setLayout((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === widgetId ? { ...w, enabled: !w.enabled } : w)),
    }));
  }, []);

  const resetLayout = useCallback(() => {
    setLayout({
      widgets: DEFAULT_WIDGETS,
      columns: 4,
    });
  }, []);

  const getEnabledWidgets = useCallback(() => {
    return layout.widgets.filter((w) => w.enabled).sort((a, b) => a.position - b.position);
  }, [layout.widgets]);

  return {
    layout,
    isCustomizing,
    setIsCustomizing,
    updateWidget,
    reorderWidgets,
    toggleWidget,
    resetLayout,
    getEnabledWidgets,
  };
}
