
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Your Azure OpenAI endpoint details
const AZURE_ENDPOINT = 'https://jcoro-m47u5ub8-eastus2.openai.azure.com/openai/deployments/gpt-4o-transcribe/audio/transcriptions?api-version=2025-03-01-preview';
const AZURE_API_KEY = '1LTdUX9wUqivScnSfdCwRPJOfn7ze193I3w0TO8lA4ssYkOuJjv3JQQJ99ALACHYHv6XJ3w3AAAAACOGklG4';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Transcribe audio function called');
    
    const { audio } = await req.json();
    
    if (!audio) {
      throw new Error('No audio data provided');
    }

    console.log('Converting base64 audio to blob...');
    
    // Convert base64 to binary
    const binaryString = atob(audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create form data
    const formData = new FormData();
    const audioBlob = new Blob([bytes], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'audio.webm');

    console.log('Sending request to Azure OpenAI...');
    
    // Send to Azure OpenAI GPT-4o-transcribe
    const response = await fetch(AZURE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AZURE_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI API error:', errorText);
      throw new Error(`Azure OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Transcription successful:', result.text);

    return new Response(
      JSON.stringify({ text: result.text }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in transcribe-audio function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error al procesar el audio'
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});
