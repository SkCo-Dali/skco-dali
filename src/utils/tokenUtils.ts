
export function decodeJwtPayload(token: string): Record<string, any> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.warn('Invalid JWT token format');
            return null;
        }

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
}

export function extractIdpAccessToken(accessToken: string): string | null {
    const payload = decodeJwtPayload(accessToken);
    if (!payload) {
        return null;
    }

    const idpToken = payload.idp_access_token;
    if (typeof idpToken === 'string' && idpToken.length > 0) {
        console.log('Successfully extracted idp_access_token from MSAL token');
        return idpToken;
    }

    console.warn('idp_access_token claim not found in token');
    return null;
}