
import { loginRequest } from '@/authConfig';
import { ENV } from '@/config/environment';
import { IPublicClientApplication } from '@azure/msal-browser';
import { register } from 'fetch-intercept';

const protectedEndpoints = [
    ENV.CRM_API_BASE_URL,
    ENV.AI_API_BASE_URL,
    ENV.MAESTRO_API_BASE_URL,
    ENV.TEMPLATES_API_BASE_URL,
    ENV.MARKET_DALI_API_BASE_URL       
];

export const registerMsalFetchInterceptor = (instance: IPublicClientApplication) => {
    register({
        request: async function (url, config) {
            // Example: Check if the URL is a protected API endpoint
            if (protectedEndpoints.some(endpoint => url.startsWith(endpoint)) && instance.getAllAccounts().length > 0) {
                console.log("🔐 [MSAL Fetch Interceptor] Intercepting request to protected endpoint:", url);
                try {
                    
                    const account = instance.getActiveAccount()
                    // const response = await instance.acquireTokenSilent(loginRequest);
               
                    if(config.headers) {
                        config.headers.Authorization = `Bearer ${account.idToken}`;
                    } else {
                        config.headers = { Authorization: `Bearer ${account.idToken}` };
                    }
                    
                } catch (error) {
                    debugger;
                    console.error("Error acquiring token silently:", error);
                    // Handle token acquisition failure (e.g., redirect to login)
                }
            }
            return [url, config];
        },
        requestError: function (error) {
            return Promise.reject(error);
        },
        response: function (response) {
            return response;
        },
        responseError: function (error) {
            return Promise.reject(error);
        }
    });
};

// In your main App component or a dedicated setup file:
// const { instance } = useMsal();
// useEffect(() => {
//     registerMsalFetchInterceptor(instance);
// }, [instance]);