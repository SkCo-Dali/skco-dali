export type WidgetType =
  | "banner"
  | "achievements"
  | "metrics"
  | "commissions"
  | "distribution"
  | "agenda"
  | "opportunities"
  | "leaderboard";

export type WidgetSize = "small" | "medium" | "large" | "full";

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: number;
  enabled: boolean;
  minSize?: WidgetSize;
  resizable?: boolean;
}

export interface DashboardLayout {
  widgets: WidgetConfig[];
  columns: number;
}

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  {
    id: "banner-1",
    type: "banner",
    title: "Banner promocional",
    size: "full",
    position: 0,
    enabled: true,
    minSize: "full",
    resizable: false,
  },
  {
    id: "achievements-1",
    type: "achievements",
    title: "Logros y progreso",
    size: "full",
    position: 1,
    enabled: true,
    minSize: "large",
    resizable: true,
  },
  {
    id: "metrics-1",
    type: "metrics",
    title: "Métricas de leads",
    size: "large",
    position: 2,
    enabled: true,
    minSize: "medium",
    resizable: true,
  },
  {
    id: "commissions-1",
    type: "commissions",
    title: "Comisiones",
    size: "medium",
    position: 3,
    enabled: true,
    minSize: "medium",
    resizable: true,
  },
  {
    id: "distribution-1",
    type: "distribution",
    title: "Distribución de clientes",
    size: "medium",
    position: 4,
    enabled: true,
    minSize: "medium",
    resizable: true,
  },
  {
    id: "agenda-1",
    type: "agenda",
    title: "Agenda de hoy",
    size: "medium",
    position: 5,
    enabled: true,
    minSize: "medium",
    resizable: true,
  },
  {
    id: "opportunities-1",
    type: "opportunities",
    title: "Oportunidades",
    size: "medium",
    position: 6,
    enabled: true,
    minSize: "medium",
    resizable: true,
  },
  {
    id: "leaderboard-1",
    type: "leaderboard",
    title: "Ranking",
    size: "medium",
    position: 7,
    enabled: true,
    minSize: "small",
    resizable: true,
  },
];

export const WIDGET_SIZE_MAP: Record<WidgetSize, string> = {
  small: "col-span-1",
  medium: "col-span-2",
  large: "col-span-3",
  full: "col-span-4",
};
