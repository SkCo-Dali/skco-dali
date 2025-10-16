
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { validateEnvironment, ENV } from '@/config/environment'
import { AuthenticationResult, EventType, PublicClientApplication } from '@azure/msal-browser'
import { msalConfigB2C, msalConfigB2E } from './authConfig.ts'

validateEnvironment();

/**
 * MSAL Instances Configuration
 *
 * Two separate MSAL instances are created:
 * 1. msalInstanceB2C: For organizational APIs (primary authentication)
 * 2. msalInstanceB2E: For Microsoft Graph API (secondary authentication)
 *
 * MSAL should be instantiated outside of the component tree to prevent re-instantiation on re-renders.
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */

const msalInstanceB2C = new PublicClientApplication(msalConfigB2C);

let msalInstanceB2E: PublicClientApplication | null = null;

if (ENV.B2E_CLIENT_ID && ENV.B2E_TENANT_ID) {
    msalInstanceB2E = new PublicClientApplication(msalConfigB2E);
}

const initializeMsalInstance = async (instance: PublicClientApplication, label: string) => {
    await instance.initialize();

    if (!instance.getActiveAccount() && instance.getAllAccounts().length > 0) {
        instance.setActiveAccount(instance.getAllAccounts()[0]);
    }

    instance.addEventCallback((event) => {
        if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
            const payload = event.payload as AuthenticationResult;
            const account = payload.account;
            instance.setActiveAccount(account);
            console.log(`[${label}] Login successful for account:`, account.username);
        }
    });
};

(async () => {
    await initializeMsalInstance(msalInstanceB2C, 'B2C');

    if (msalInstanceB2E) {
        await initializeMsalInstance(msalInstanceB2E, 'B2E');
    }

    const root = createRoot(document.getElementById('root')!);
    root.render(
        <StrictMode>
            <App msalInstanceB2C={msalInstanceB2C} msalInstanceB2E={msalInstanceB2E} />
        </StrictMode>
    );
})();