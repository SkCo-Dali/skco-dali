
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured')
    }

    console.log('Starting WebSocket proxy to OpenAI Realtime API')
    
    const upgrade = req.headers.get('upgrade') || ''
    if (upgrade.toLowerCase() !== 'websocket') {
      return new Response('Expected websocket upgrade', { status: 426 })
    }

    const { socket, response } = Deno.upgradeWebSocket(req)
    let openaiWs: WebSocket | null = null

    socket.onopen = () => {
      console.log('Client WebSocket connected')
      
      // Connect to OpenAI Realtime API
      const openaiUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`
      openaiWs = new WebSocket(openaiUrl, [], {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      })

      openaiWs.onopen = () => {
        console.log('Connected to OpenAI Realtime API')
      }

      openaiWs.onmessage = (event) => {
        console.log('Received from OpenAI:', event.data)
        socket.send(event.data)
      }

      openaiWs.onclose = () => {
        console.log('OpenAI WebSocket closed')
        socket.close()
      }

      openaiWs.onerror = (error) => {
        console.error('OpenAI WebSocket error:', error)
        socket.close()
      }
    }

    socket.onmessage = (event) => {
      console.log('Received from client:', event.data)
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(event.data)
      }
    }

    socket.onclose = () => {
      console.log('Client WebSocket closed')
      if (openaiWs) {
        openaiWs.close()
      }
    }

    socket.onerror = (error) => {
      console.error('Client WebSocket error:', error)
      if (openaiWs) {
        openaiWs.close()
      }
    }

    return response
  } catch (error) {
    console.error('Error in realtime-voice function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
