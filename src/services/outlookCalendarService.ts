import { extractIdpAccessToken } from '@/utils/tokenUtils';

export interface OutlookEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  isAllDay: boolean;
  isOnlineMeeting: boolean;
  onlineMeeting?: {
    joinUrl: string;
  };
}

interface OutlookCalendarResponse {
  value: OutlookEvent[];
}

/**
 * Get calendar events from Microsoft Graph API
 */
export async function getOutlookCalendarEvents(
  accessToken: string,
  startDateTime: string,
  endDateTime: string
): Promise<OutlookEvent[]> {
  try {
    // Extract the idp_access_token from the MSAL token
    const graphToken = extractIdpAccessToken(accessToken);
    
    if (!graphToken) {
      console.error('No idp_access_token found in access token');
      throw new Error('No se pudo obtener el token de Microsoft Graph');
    }

    // Build the query parameters
    const params = new URLSearchParams({
      $select: 'subject,start,end,location,isAllDay,isOnlineMeeting,onlineMeeting',
      $filter: `start/dateTime ge '${startDateTime}' and end/dateTime le '${endDateTime}'`,
      $orderby: 'start/dateTime',
      $top: '50'
    });

    // Call Microsoft Graph API
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendar/events?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${graphToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Microsoft Graph API error:', response.status, errorText);
      throw new Error(`Error al obtener eventos del calendario: ${response.status}`);
    }

    const data: OutlookCalendarResponse = await response.json();
    return data.value || [];
  } catch (error) {
    console.error('Error fetching Outlook calendar events:', error);
    throw error;
  }
}

/**
 * Get date range for filtering events
 */
export function getDateRange(period: 'today' | 'thisWeek' | 'nextWeek'): {
  startDateTime: string;
  endDateTime: string;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'today':
      startDate = today;
      endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000); // +1 day
      break;
      
    case 'thisWeek':
      // Start from today
      startDate = today;
      // End on Sunday
      const daysUntilSunday = 7 - now.getDay();
      endDate = new Date(today.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000);
      endDate.setHours(23, 59, 59, 999);
      break;
      
    case 'nextWeek':
      // Start on next Monday
      const daysUntilNextMonday = (8 - now.getDay()) % 7 || 7;
      startDate = new Date(today.getTime() + daysUntilNextMonday * 24 * 60 * 60 * 1000);
      // End on next Sunday
      endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  return {
    startDateTime: startDate.toISOString(),
    endDateTime: endDate.toISOString(),
  };
}
