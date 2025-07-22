import { AISettings } from "../types/settings";
import { ENV } from "../config/environment";

interface AzureApiResponse {
  text?: string;
  data?: any;
  chart?: any;
  downloadLink?: { url: string; filename: string };
  videoPreview?: any;
  processingTime?: number;
  ipAddress?: string;
}

// Helper function to wait for a specified number of milliseconds
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Helper function to make API call with retry logic
const makeApiCallWithRetry = async (
  requestBody: any,
  maxRetries: number = 3,
  baseDelay: number = 5000
): Promise<Response> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🎯 MAESTRO API CALL ATTEMPT ${attempt}/${maxRetries}`);
      console.log('🌐 Endpoint:', `${ENV.MAESTRO_API_BASE_URL}/api/maestro`);
      console.log('🔧 Method: POST');
      console.log('📤 Headers: Content-Type: application/json');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ API call timeout - aborting attempt ${attempt}`);
        controller.abort();
      }, 240000); // 4 minutes timeout (240 seconds)
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if access token is provided
      if (requestBody.EntraToken) {
        headers['Authorization'] = `Bearer ${requestBody.EntraToken}`;
      }

      const response = await fetch(`${ENV.MAESTRO_API_BASE_URL}/api/maestro`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log(`📥 MAESTRO API RESPONSE ATTEMPT ${attempt} STATUS:`, response.status);
      console.log(`📥 MAESTRO API RESPONSE ATTEMPT ${attempt} OK:`, response.ok);
      console.log(`📥 MAESTRO API RESPONSE ATTEMPT ${attempt} HEADERS:`, Object.fromEntries(response.headers.entries()));

      // If the response is successful, return it immediately
      if (response.ok) {
        console.log(`✅ MAESTRO API CALL SUCCESSFUL ON ATTEMPT ${attempt}`);
        return response;
      }

      // If it's a 500 error and we have retries left, continue to retry
      if (response.status === 500 && attempt < maxRetries) {
        const errorText = await response.text();
        console.error(`❌ MAESTRO API ERROR ATTEMPT ${attempt}:`, response.status, errorText.substring(0, 500));
        console.log(`🔄 RETRYING IN ${baseDelay}ms... (${maxRetries - attempt} retries left)`);
        
        // Wait before the next retry
        await sleep(baseDelay);
        
        // Store the error for potential final throw
        lastError = new Error(errorText || `API Error: ${response.status} - ${response.statusText}`);
        continue;
      }

      // If it's not a 500 error or we're out of retries, throw immediately
      const errorText = await response.text();
      console.error(`❌ MAESTRO API FINAL ERROR ATTEMPT ${attempt}:`, response.status, errorText.substring(0, 500));
      throw new Error(errorText || `API Error: ${response.status} - ${response.statusText}`);
      
    } catch (error) {
      console.error(`❌ MAESTRO API CALL FAILED ATTEMPT ${attempt}:`, error);
      
      // Check if it's a timeout or abort error
      if (error.name === 'AbortError') {
        console.error(`⏰ Request was aborted due to timeout on attempt ${attempt}`);
        lastError = new Error('Timeout - El servidor no respondió a tiempo');
      } else if (error.message?.includes('CORS')) {
        console.error(`🚫 API call failed due to CORS policy on attempt ${attempt}`);
        lastError = new Error('Error de política CORS');
      } else if (error.message?.includes('Failed to fetch')) {
        console.error(`🌐 API call failed - network issue or server unreachable on attempt ${attempt}`);
        lastError = new Error('No se pudo conectar al servidor');
      } else {
        lastError = error as Error;
      }
      
      // If we have retries left and it's a network/timeout error, retry
      if (attempt < maxRetries && (error.name === 'AbortError' || error.message?.includes('Failed to fetch'))) {
        console.log(`🔄 RETRYING IN ${baseDelay}ms DUE TO NETWORK ERROR... (${maxRetries - attempt} retries left)`);
        await sleep(baseDelay);
        continue;
      }
      
      // If it's the last attempt or a non-retryable error, break
      break;
    }
  }
  
  // If we get here, all retries failed
  console.error(`❌ ALL ${maxRetries} RETRY ATTEMPTS FAILED`);
  throw lastError;
};

export const callAzureAgentApi = async (
  message: string, 
  files: File[], 
  settings: AISettings,
  userEmail: string,
  accessToken?: string | null,
  conversationId?: string
): Promise<AzureApiResponse> => {
  console.log('🚀 === AZURE API SERVICE: STARTING MAESTRO API CALL ===');
  console.log('📧 User email:', userEmail);
  console.log('🔑 Access token present:', !!accessToken);
  console.log('🔗 Conversation ID:', conversationId);
  console.log('📝 Message provided:', !!message.trim());
  console.log('📎 Files count:', files.length);
  
  const startTime = Date.now();
  
  // Preparar el body para el API del maestro
  const requestBody: any = {
    App: "Dali",
    correo: userEmail,
    EntraToken: accessToken || '',
    IdConversacion: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };

  // Solo agregar el campo "pregunta" si se proporciona un mensaje
  if (message.trim()) {
    requestBody.pregunta = message;
    console.log('📝 Message included in request');
  } else {
    console.log('📝 No message provided - maestro will read from conversation');
  }

  console.log('📋 REQUEST BODY PREPARED:');
  console.log('  - App:', requestBody.App);
  console.log('  - pregunta:', requestBody.pregunta ? requestBody.pregunta.substring(0, 100) + (requestBody.pregunta.length > 100 ? '...' : '') : 'NOT_INCLUDED');
  console.log('  - correo:', requestBody.correo);
  console.log('  - EntraToken:', accessToken ? accessToken.substring(0, 30) + '...' : 'empty');
  console.log('  - IdConversacion:', requestBody.IdConversacion);

  try {
    console.log('🎯 MAESTRO API CALL WITH RETRY MECHANISM STARTING...');
    
    // Make the API call with retry logic
    const response = await makeApiCallWithRetry(requestBody, 1, 5000);
    
    // Procesar respuesta
    const responseText = await response.text();
    console.log('📊 MAESTRO API RESPONSE SIZE:', responseText.length, 'characters');
    console.log('📄 MAESTRO API RESPONSE (first 500 chars):', responseText.substring(0, 500));
    
    let apiData;
    console.log('⚡ Processing normal response...');
    try {
      apiData = JSON.parse(responseText);
      console.log('✅ MAESTRO API JSON PARSED SUCCESSFULLY');
      console.log('📊 Parsed data structure:', Object.keys(apiData || {}));
    } catch (parseError) {
      console.log('❌ MAESTRO API JSON PARSE FAILED:', parseError);
      console.log('📄 Treating as text response');
      apiData = { text: responseText.substring(0, 10000) };
    }
    
    console.log('🔍 MAESTRO API PROCESSED DATA TYPE:', typeof apiData);
    console.log('🔍 MAESTRO API DATA KEYS:', Object.keys(apiData || {}));
    
    console.log('✅ MAESTRO API CALL WITH RETRIES SUCCESSFUL - Processing response...');
    return processMaestroApiResponse(apiData, startTime);
    
  } catch (error) {
    console.error('❌ MAESTRO API CALL WITH RETRIES FAILED:', error);
    console.error('🔍 Error name:', error.name);
    console.error('🔍 Error type:', typeof error);
    
    // Return the original error message directly
    const errorMessage = error.message || 'Error desconocido del servidor';

    console.log('⚠️ RETURNING ORIGINAL ERROR MESSAGE TO USER:', errorMessage);
    return {
      text: errorMessage,
      processingTime: Date.now() - startTime
    };
  }
};

function processMaestroApiResponse(apiData: any, startTime: number): AzureApiResponse {
  const processingTime = Date.now() - startTime;
  
  console.log('🔄 === PROCESSING MAESTRO API RESPONSE ===');
  console.log('⏱️ Processing time so far:', processingTime, 'ms');
  console.log('🔍 API Data structure analysis:');
  console.log('  - Type:', typeof apiData);
  console.log('  - Keys:', Object.keys(apiData || {}));
  console.log('  - Has respuesta:', !!(apiData && apiData.respuesta));
  console.log('  - Has acciones_ejecutadas:', !!(apiData && apiData.acciones_ejecutadas));
  console.log('  - Acciones count:', apiData?.acciones_ejecutadas?.length || 0);
  
  let responseText = '';
  let tableData = undefined;
  let chartData = undefined;
  let downloadLink = undefined;
  let videoPreview = undefined;
  
  // COMBINAR TEXTO DE RESPUESTA Y ACCIONES EJECUTADAS
  const textParts = [];
  
  // Agregar el campo "respuesta" si existe
  if (apiData && apiData.respuesta) {
    textParts.push(apiData.respuesta);
    console.log('📝 RESPONSE TEXT ADDED:', apiData.respuesta.length, 'characters');
  }
  
  // PROCESAR Y COMBINAR ACCIONES EJECUTADAS
  if (apiData && apiData.acciones_ejecutadas && Array.isArray(apiData.acciones_ejecutadas)) {
    console.log('🔍 PROCESSING EXECUTED ACTIONS:', apiData.acciones_ejecutadas.length, 'actions');
    
    for (let i = 0; i < apiData.acciones_ejecutadas.length; i++) {
      const accion = apiData.acciones_ejecutadas[i];
      console.log(`📋 Action ${i + 1}:`, accion.accion);
      console.log(`📋 Action ${i + 1} summary length:`, accion.resumen?.length || 0);
      
      // Agregar el resumen de la acción al texto
      if (accion.resumen) {
        textParts.push(`\n\n**${accion.accion}:**\n${accion.resumen}`);
        console.log(`📝 ACTION ${i + 1} TEXT ADDED:`, accion.resumen.length, 'characters');
      }
      
      // Buscar datos tabulares en resultado.data
      if (accion.resultado && accion.resultado.data && Array.isArray(accion.resultado.data)) {
        const dataArray = accion.resultado.data;
        console.log(`📊 FOUND TABLE DATA in action ${i + 1}:`, dataArray.length, 'rows');
        console.log(`📊 Sample data from action ${i + 1}:`, dataArray[0]);
        
        if (dataArray.length > 0) {
          // Extraer headers de la primera fila de datos
          const headers = Object.keys(dataArray[0]);
          const rows = dataArray.map((row: any) => Object.values(row));
          
          tableData = {
            headers,
            rows
          };
          
          console.log('✅ TABLE DATA CREATED:');
          console.log('  - Headers count:', headers.length);
          console.log('  - Headers:', headers);
          console.log('  - Rows count:', rows.length);
          console.log('  - First row sample:', rows[0]);
          
          // Limitar datos para performance en UI si es necesario
          if (rows.length > 100) {
            console.log('⚠️ Large dataset detected, limiting to first 100 rows for UI performance');
            tableData.rows = rows.slice(0, 100);
            console.log('✂️ Table data trimmed to 100 rows');
          }
          
          // Agregar descripción de la tabla al texto
          textParts.push(`\n\n**Datos encontrados:** ${rows.length} registros con ${headers.length} campos.`);
          console.log(`📝 TABLE DESCRIPTION ADDED: ${rows.length} records with ${headers.length} fields`);
          
          // Salir del loop ya que encontramos los datos principales
          break;
        }
      }
      
      // También buscar gráficas si las hay en el resultado
      if (accion.resultado && accion.resultado.chart) {
        chartData = accion.resultado.chart;
        console.log('📈 FOUND CHART DATA in action', i + 1, ':', chartData);
      }
      
      // Buscar enlaces de descarga
      if (accion.resultado && accion.resultado.downloadUrl) {
        downloadLink = {
          url: accion.resultado.downloadUrl,
          filename: accion.resultado.filename || `reporte_${Date.now()}.pdf`
        };
        console.log('📥 FOUND DOWNLOAD LINK in action', i + 1, ':', downloadLink);
      }
    }
  }
  
  // COMBINAR TODAS LAS PARTES DE TEXTO
  responseText = textParts.join('').trim();
  
  // Si no hay texto de respuesta, crear uno por defecto
  if (!responseText) {
    if (tableData) {
      responseText = `Se encontraron ${tableData.rows.length} registros con ${tableData.headers.length} campos.`;
      console.log('📝 GENERATED DEFAULT TEXT for table data:', responseText);
    } else {
      responseText = 'Respuesta procesada correctamente.';
      console.log('📝 GENERATED DEFAULT TEXT (generic):', responseText);
    }
  }

  const finalResponse = {
    text: responseText,
    data: tableData,
    chart: chartData,
    downloadLink: downloadLink,
    videoPreview: videoPreview,
    processingTime
  };

  console.log('✅ === MAESTRO RESPONSE PROCESSING COMPLETED ===');
  console.log('📊 FINAL RESPONSE STRUCTURE:');
  console.log('  - Has text:', !!finalResponse.text);
  console.log('  - Text length:', finalResponse.text?.length || 0);
  console.log('  - Text preview:', finalResponse.text?.substring(0, 200) + '...');
  console.log('  - Has table:', !!finalResponse.data);
  console.log('  - Table columns:', finalResponse.data?.headers?.length || 0);
  console.log('  - Table rows:', finalResponse.data?.rows?.length || 0);
  console.log('  - Has chart:', !!finalResponse.chart);
  console.log('  - Has download:', !!finalResponse.downloadLink);
  console.log('  - Processing time:', finalResponse.processingTime, 'ms');
  console.log('🏁 === END AZURE API SERVICE ===');

  return finalResponse;
}
