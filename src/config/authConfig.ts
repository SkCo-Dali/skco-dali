
import { ENV } from '@/config/environment';

// Microsoft Graph API configuration
export const graphConfig = {
  graphMeEndpoint: `${ENV.GRAPH_API_BASE_URL}/me`,
  graphPhotoEndpoint: `${ENV.GRAPH_API_BASE_URL}/me/photo/$value`
};
