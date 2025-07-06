
export interface CalendlyEvent {
  uri: string;
  name: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  event_type: string;
  status: 'active' | 'canceled';
  location?: {
    type: string;
    location?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  event_memberships: Array<{
    user: string;
    user_name: string;
    user_email: string;
  }>;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  slug: string;
  scheduling_url: string;
  duration: number;
  kind: string;
  color: string;
}

export interface CalendlyCalendar {
  uri: string;
  name: string;
  primary: boolean;
}

export interface CalendlyFilters {
  selectedCalendars: string[];
  selectedEventTypes: string[];
  status: 'active' | 'canceled' | 'all';
}
