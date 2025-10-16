
import { loginRequest } from '@/authConfig';
import { ENV } from '@/config/environment';
import { IPublicClientApplication } from '@azure/msal-browser';
import { register } from 'fetch-intercept';
import { extractIdpAccessToken } from './tokenUtils';

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
            // Normalize config to avoid undefined errors
            let cfg: RequestInit & { headers?: HeadersInit } = config || {};

            // Determine URL string for matching
            const reqUrl = typeof url === 'string' ? url : (url as Request).url;

            // Check if the URL is a protected API endpoint and there is an active account
            if (protectedEndpoints.some(endpoint => reqUrl?.startsWith(endpoint)) && instance.getAllAccounts().length > 0) {
                try {
                    const account = instance.getActiveAccount();

                    // Try to get an access token; fall back to idToken if needed
                    let bearerToken: string | undefined;
                    if (account) {
                        try {
                            const tokenResp = await instance.acquireTokenSilent({ ...loginRequest, account });
                            bearerToken = tokenResp.accessToken;
                        } catch (e) {
                            console.warn("MSAL acquireTokenSilent failed, falling back to idToken", e);
                            bearerToken = account.idToken;
                        }
                    }

                    if (bearerToken) {
                        // Ensure headers object exists and set Authorization header
                        if (cfg.headers instanceof Headers) {
                            cfg.headers.set('Authorization', `Bearer ${bearerToken}`);
                        } else {
                            cfg.headers = {
                                ...(cfg.headers as Record<string, string> | undefined),
                                Authorization: `Bearer ${bearerToken}`,
                            };
                        }

                        // Check if the URL ends with /api/emails/send
                        if (reqUrl?.endsWith('/api/emails/send')) {
                            console.log('Detected /api/emails/send endpoint - extracting idp_access_token');

                            const idpToken = extractIdpAccessToken(bearerToken);

                            if (idpToken) {
                                console.log('Adding X-Graph-Token header with idp_access_token');

                                if (cfg.headers instanceof Headers) {
                                    cfg.headers.set('X-Graph-Token', idpToken);
                                } else {
                                    cfg.headers = {
                                        ...(cfg.headers as Record<string, string>),
                                        'X-Graph-Token': idpToken,
                                    };
                                }
                            } else {
                                console.warn('Could not extract idp_access_token for /api/emails/send - request will continue without X-Graph-Token header');
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error acquiring token silently:", error);
                    // Handle token acquisition failure (e.g., redirect to login)
                }
            }
            return [url, cfg];
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