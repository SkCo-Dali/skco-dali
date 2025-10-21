
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { validateEnvironment } from '@/config/environment'
import { AuthenticationResult, EventMessage, EventType, PublicClientApplication } from '@azure/msal-browser'
import { msalConfig } from './authConfig.ts'

// Validate environment variables on startup
validateEnvironment();

/**
 * MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders.
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
const msalInstance = new PublicClientApplication(msalConfig);


// Default to using the first account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    // Account selection logic is app dependent. Adjust as needed for different use cases.
    debugger;
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}


const root = createRoot(document.getElementById('root'));
root.render(
    <StrictMode>
        <App pca={msalInstance} />
    </StrictMode>
);