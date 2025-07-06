
import { Configuration, PopupRequest } from '@azure/msal-browser';

// Configuración MSAL para Microsoft Entra ID
export const msalConfig: Configuration = {
  auth: {
    clientId: '2cc89bfe-6192-40e2-80a8-fd218121c623', // Reemplazar con tu Client ID real
    authority: 'https://login.microsoftonline.com/08271f42-81ef-45d6-81ac-49776c4be615',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Scopes para Microsoft Graph API
export const loginRequest: PopupRequest = {
  scopes: [
    'Chat.Create',
'Chat.Read',
'Chat.ReadBasic',
'Chat.ReadWrite',
'ChatMessage.Read',
'ChatMessage.Send',
'Contacts.Read',
'Contacts.Read.Shared',
'Contacts.ReadWrite',
'Contacts.ReadWrite.Shared',
'Files.Read',
'Files.Read.All',
'Files.Read.Selected',
'Files.ReadWrite',
'Files.ReadWrite.All',
'Files.ReadWrite.AppFolder',
'Files.ReadWrite.Selected',
'Mail.Read',
'Mail.Read.Shared',
'Mail.ReadBasic',
'Mail.ReadBasic.Shared',
'Mail.ReadWrite',
'Mail.ReadWrite.Shared',
'Mail.Send',
'Mail.Send.Shared',
'User.Read',
'User.ReadBasic.All',
'User.ReadWrite',
'UserNotification.ReadWrite.CreatedByApp'
  ],
};

// Scopes específicos para el calendario
export const calendarRequest: PopupRequest = {
  scopes: [
    'Calendars.Read',
'Calendars.Read.Shared',
'Calendars.ReadBasic',
'Calendars.ReadWrite',
'Calendars.ReadWrite.Shared'
  ],
};
