
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Environment configuration for Supabase edge function
const MAESTRO_API_URL = Deno.env.get('MAESTRO_API_BASE_URL') || 'API de Agente Maestro';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    // Add timeout to request body parsing
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    let requestBody;
    try {
      const bodyText = await req.text();
      requestBody = JSON.parse(bodyText);
      clearTimeout(timeoutId);
    } catch (parseError) {
      clearTimeout(timeoutId);
      console.error('❌ Error parsing request body:', parseError);
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      throw new Error(`Invalid JSON in request body: ${errorMessage}`);
    }
    
    const { App, pregunta, EntraToken, IdConversacion } = requestBody;
    
    // Validate required fields
    if (!App || !pregunta) {
      console.error('❌ Missing required fields');
      throw new Error('Missing required fields: App, pregunta');
    }
    
    // Make request to new Maestro API with extended timeout
    const apiController = new AbortController();
    const apiTimeoutId = setTimeout(() => {
      console.warn('⚠️ API call timeout - aborting request');
      apiController.abort();
    }, 60000); // 60 second timeout for API call
    
    // Prepare headers for Maestro API
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Supabase-Edge-Function/1.0',
    };

    // Add Authorization header if EntraToken is present
    if (EntraToken) {
      headers['Authorization'] = `Bearer ${EntraToken}`;
    } else {
      console.warn('⚠️ No EntraToken provided for API authorization');
    }

    // Prepare request body WITHOUT EntraToken and correo
    const maestroRequestBody = {
      App,
      pregunta,
      IdConversacion
    };
    
    const azureResponse = await fetch(`${MAESTRO_API_URL}/api/maestro`, {
      method: 'POST',
      headers,
      body: JSON.stringify(maestroRequestBody),
      signal: apiController.signal
    });

    clearTimeout(apiTimeoutId);

    // Handle response with proper error checking
    if (!azureResponse.ok) {
      console.error('❌ MAESTRO API ERROR FROM PROXY');
      console.error('❌ Status:', azureResponse.status);
      console.error('❌ Status Text:', azureResponse.statusText);
      
      let errorText = 'Unknown error';
      try {
        errorText = await azureResponse.text();
        console.error('❌ Error response body:', errorText.substring(0, 500));
      } catch (errorParseError) {
        console.error('❌ Could not parse error response:', errorParseError);
      }
      
      return new Response(
        JSON.stringify({
          error: `Maestro API error: ${azureResponse.status} - ${azureResponse.statusText}`,
          details: errorText.substring(0, 200),
          timestamp: new Date().toISOString()
        }),
        {
          status: azureResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Try to parse as JSON first
    let responseText;
    try {
      responseText = await azureResponse.text();
    } catch (textError) {
      console.error('❌ Error reading response text:', textError);
      const errorMessage = textError instanceof Error ? textError.message : String(textError);
      throw new Error(`Could not read API response: ${errorMessage}`);
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      data = { text: responseText };
    }
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      },
    );
    
  } catch (error) {
    console.error('❌ AZURE AGENT PROXY ERROR');
    const errorObj = error instanceof Error ? error : new Error(String(error));
    console.error('❌ Error type:', errorObj.constructor.name);
    console.error('❌ Error message:', errorObj.message);
    console.error('❌ Error stack:', errorObj.stack);
    
    // Check if it's a timeout or abort error
    if (errorObj.name === 'AbortError') {
      console.error('⏰ Request was aborted due to timeout');
    }
    
    const errorResponse = {
      error: errorObj.message,
      details: 'Error in Azure Agent Proxy function for Maestro API',
      timestamp: new Date().toISOString(),
      errorType: errorObj.constructor.name
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
