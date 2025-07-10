
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Environment configuration for Supabase edge function
const MAESTRO_API_URL = Deno.env.get('MAESTRO_API_BASE_URL') || 'API de Agente Maestro';

serve(async (req) => {
  console.log('🚀 === AZURE AGENT PROXY: REQUEST RECEIVED ===');
  console.log('🔧 Method:', req.method);
  console.log('🌐 URL:', req.url);
  console.log('📤 Headers:', Object.fromEntries(req.headers.entries()));
  console.log('🌍 Origin:', req.headers.get('origin'));
  console.log('🔒 Authorization:', req.headers.get('authorization') ? 'Present' : 'Missing');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ CORS preflight request handled');
    return new Response('ok', { 
      headers: corsHeaders,
      status: 200
    })
  }

  try {
    console.log('📋 Parsing request body...');
    
    // Add timeout to request body parsing
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('📄 Raw request body length:', bodyText.length);
      console.log('📄 Raw request body preview:', bodyText.substring(0, 200));
      
      requestBody = JSON.parse(bodyText);
      clearTimeout(timeoutId);
    } catch (parseError) {
      clearTimeout(timeoutId);
      console.error('❌ Error parsing request body:', parseError);
      throw new Error(`Invalid JSON in request body: ${parseError.message}`);
    }
    
    const { App, pregunta, correo, EntraToken, IdConversacion } = requestBody;
    
    console.log('📊 === REQUEST BODY ANALYSIS ===');
    console.log('  - App:', App);
    console.log('  - pregunta length:', pregunta?.length || 0);
    console.log('  - pregunta preview:', pregunta?.substring(0, 50) + (pregunta?.length > 50 ? '...' : ''));
    console.log('  - correo:', correo);
    console.log('  - EntraToken present:', !!EntraToken);
    console.log('  - EntraToken preview:', EntraToken ? EntraToken.substring(0, 20) + '...' : 'empty');
    console.log('  - IdConversacion:', IdConversacion);
    
    // Validate required fields
    if (!App || !pregunta || !correo) {
      console.error('❌ Missing required fields');
      throw new Error('Missing required fields: App, pregunta, correo');
    }
    
    // Make request to new Maestro API with extended timeout
    console.log('🎯 === CALLING MAESTRO API FROM PROXY ===');
    console.log('🌐 Target URL:', `${MAESTRO_API_URL}/api/maestro`);
    console.log('🔧 Method: POST');
    console.log('📤 Request body prepared for Maestro API');
    console.log('⏰ Starting API call...');
    
    const apiController = new AbortController();
    const apiTimeoutId = setTimeout(() => {
      console.log('⚠️ API call timeout - aborting request');
      apiController.abort();
    }, 60000); // 60 second timeout for API call
    
    const azureResponse = await fetch(`${MAESTRO_API_URL}/api/maestro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function/1.0',
      },
      body: JSON.stringify({
        App,
        pregunta,
        correo,
        EntraToken: EntraToken || '',
        IdConversacion
      }),
      signal: apiController.signal
    });

    clearTimeout(apiTimeoutId);
    
    console.log('📥 === MAESTRO API RESPONSE FROM PROXY ===');
    console.log('📊 Response status:', azureResponse.status);
    console.log('✅ Response ok:', azureResponse.ok);
    console.log('📥 Response headers:', Object.fromEntries(azureResponse.headers.entries()));
    console.log('🌐 Response type:', azureResponse.headers.get('content-type'));

    // Handle response with proper error checking
    if (!azureResponse.ok) {
      console.error('❌ === MAESTRO API ERROR FROM PROXY ===');
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
      console.log('📄 Raw response length:', responseText.length, 'characters');
      console.log('📄 Raw response preview (first 500 chars):', responseText.substring(0, 500));
    } catch (textError) {
      console.error('❌ Error reading response text:', textError);
      throw new Error(`Could not read API response: ${textError.message}`);
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ Successfully parsed JSON response from Maestro API');
      console.log('📊 Parsed response keys:', Object.keys(data || {}));
      console.log('📊 Response structure analysis:');
      console.log('  - Has respuesta:', !!(data && data.respuesta));
      console.log('  - Has acciones_ejecutadas:', !!(data && data.acciones_ejecutadas));
      console.log('  - Acciones count:', data?.acciones_ejecutadas?.length || 0);
    } catch (parseError) {
      console.log('❌ Response is not JSON, treating as text:', parseError);
      console.log('📄 Converting to text response format');
      data = { text: responseText };
    }

    console.log('✅ === PROXY SUCCESS - RETURNING DATA ===');
    console.log('📊 Final data keys being returned:', Object.keys(data || {}));
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      },
    );
    
  } catch (error) {
    console.error('❌ === AZURE AGENT PROXY ERROR ===');
    console.error('❌ Error type:', error.constructor.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Check if it's a timeout or abort error
    if (error.name === 'AbortError') {
      console.error('⏰ Request was aborted due to timeout');
    }
    
    const errorResponse = {
      error: error.message,
      details: 'Error in Azure Agent Proxy function for Maestro API',
      timestamp: new Date().toISOString(),
      errorType: error.constructor.name
    };
    
    console.log('⚠️ Returning error response:', errorResponse);
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
