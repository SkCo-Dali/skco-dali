
import { AISettings } from "../types/settings";

interface AzureApiResponse {
  text?: string;
  data?: any;
  chart?: any;
  downloadLink?: { url: string; filename: string };
  videoPreview?: any;
  processingTime?: number;
  ipAddress?: string;
}

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
    console.log('🎯 DIRECT API CALL: Calling Maestro API directly...');
    console.log('🌐 Endpoint: https://skcoaimultiagentdev.azurewebsites.net/api/maestro');
    console.log('🔧 Method: POST');
    console.log('📤 Headers: Content-Type: application/json');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ API call timeout - aborting');
      controller.abort();
    }, 240000); // 4 minutes timeout (240 seconds)
    
    const response = await fetch('https://skcoaimultiagentdev.azurewebsites.net/api/maestro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('📥 DIRECT API RESPONSE STATUS:', response.status);
    console.log('📥 DIRECT API RESPONSE OK:', response.ok);
    console.log('📥 DIRECT API RESPONSE HEADERS:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DIRECT API ERROR:', response.status, errorText.substring(0, 500));
      throw new Error(`API Error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    // Procesar respuesta
    const responseText = await response.text();
    console.log('📊 DIRECT API RESPONSE SIZE:', responseText.length, 'characters');
    console.log('📄 DIRECT API RESPONSE (first 500 chars):', responseText.substring(0, 500));
    
    let apiData;
    console.log('⚡ Processing normal response...');
    try {
      apiData = JSON.parse(responseText);
      console.log('✅ DIRECT API JSON PARSED SUCCESSFULLY');
      console.log('📊 Parsed data structure:', Object.keys(apiData || {}));
    } catch (parseError) {
      console.log('❌ DIRECT API JSON PARSE FAILED:', parseError);
      console.log('📄 Treating as text response');
      apiData = { text: responseText.substring(0, 10000) };
    }
    
    console.log('🔍 DIRECT API PROCESSED DATA TYPE:', typeof apiData);
    console.log('🔍 DIRECT API DATA KEYS:', Object.keys(apiData || {}));
    
    console.log('✅ DIRECT API CALL SUCCESSFUL - Processing response...');
    return processMaestroApiResponse(apiData, startTime);
    
  } catch (error) {
    console.error('❌ DIRECT API CALL FAILED:', error);
    console.error('🔍 Error name:', error.name);
    console.error('🔍 Error type:', typeof error);
    
    let errorMessage = '❌ Error al conectar con el agente: ';
    
    if (error.name === 'AbortError') {
      console.error('⏰ API call was aborted due to timeout');
      errorMessage += 'Timeout - El servidor no respondió a tiempo. ';
    } else if (error.message?.includes('CORS')) {
      console.error('🚫 API call failed due to CORS policy');
      errorMessage += 'Error de política CORS. ';
    } else if (error.message?.includes('Failed to fetch')) {
      console.error('🌐 API call failed - network issue or server unreachable');
      errorMessage += 'No se pudo conectar al servidor. ';
    } else {
      errorMessage += 'Error desconocido. ';
    }
    
    errorMessage += 'Por favor, inténtalo de nuevo en unos momentos.';

    console.log('⚠️ RETURNING ERROR MESSAGE TO USER:', errorMessage);
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
