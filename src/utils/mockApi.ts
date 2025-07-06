import { AISettings } from "../types/settings";

interface JSONPlaceholderPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export const mockApiCall = async (
  message: string, 
  files: File[], 
  settings: AISettings,
  userEmail?: string
): Promise<{
  text: string;
  data?: any;
  chart?: any;
  downloadLink?: { url: string; filename: string };
  videoPreview?: any;
  processingTime?: number;
}> => {
  console.log('mockApiCall: Starting with message:', message);
  console.log('mockApiCall: User email:', userEmail);
  
  const startTime = Date.now();
  
  try {
    // Detectar si el usuario está pidiendo contenido de video o envía enlaces
    const messageLower = message.toLowerCase();
    const isVideoRequest = messageLower.includes('youtube') || 
                          messageLower.includes('video') ||
                          messageLower.includes('vimeo') ||
                          messageLower.includes('reproducir') ||
                          messageLower.includes('ver') ||
                          messageLower.includes('tutorial') ||
                          messageLower.includes('película') ||
                          messageLower.includes('pelicula') ||
                          messageLower.includes('documental') ||
                          messageLower.match(/https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)/);

    if (isVideoRequest) {
      console.log('mockApiCall: Video request detected');
      
      // Determinar el tipo de video basado en palabras clave
      let videoData;
      
      if (messageLower.includes('youtube') || messageLower.includes('youtu.be')) {
        videoData = {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          title: 'Tutorial de React: Cómo crear componentes interactivos',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          duration: '10:30',
          platform: 'youtube' as const
        };
      } else if (messageLower.includes('vimeo')) {
        videoData = {
          url: 'https://vimeo.com/123456789',
          title: 'Introducción a TypeScript - Conceptos básicos',
          thumbnail: 'https://i.vimeocdn.com/video/123456789_640.jpg',
          duration: '8:15',
          platform: 'vimeo' as const
        };
      } else if (messageLower.includes('tutorial')) {
        videoData = {
          url: 'https://www.youtube.com/watch?v=L8_98i_bNQE',
          title: 'Aprende React en 30 minutos - Tutorial completo para principiantes',
          thumbnail: 'https://img.youtube.com/vi/L8_98i_bNQE/maxresdefault.jpg',
          duration: '30:45',
          platform: 'youtube' as const
        };
      } else if (messageLower.includes('documental')) {
        videoData = {
          url: 'https://vimeo.com/987654321',
          title: 'La evolución de la programación: De FORTRAN a React',
          thumbnail: 'https://i.vimeocdn.com/video/987654321_640.jpg',
          duration: '45:20',
          platform: 'vimeo' as const
        };
      } else {
        // Video genérico
        videoData = {
          url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
          title: 'Introducción a la Inteligencia Artificial - Conceptos fundamentales',
          thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg',
          duration: '15:42',
          platform: 'youtube' as const
        };
      }

      const processingTime = Date.now() - startTime;
      
      let responseText = `He encontrado contenido de video relacionado con tu consulta: "${message}"\n\n`;
      responseText += `📹 **${videoData.title}**\n`;
      responseText += `Duración: ${videoData.duration} | Plataforma: ${videoData.platform.charAt(0).toUpperCase() + videoData.platform.slice(1)}\n\n`;
      responseText += `Puedes ver una vista previa aquí abajo y hacer clic para reproducirlo en pantalla completa.`;

      console.log('mockApiCall: Returning video data:', videoData);

      return {
        text: responseText,
        videoPreview: videoData,
        processingTime
      };
    }

    // Detectar si el usuario está pidiendo gráficas
    const isChartRequest = messageLower.includes('gráfica') || 
                          messageLower.includes('grafica') ||
                          messageLower.includes('chart') ||
                          messageLower.includes('barras') ||
                          messageLower.includes('líneas') ||
                          messageLower.includes('lineas') ||
                          messageLower.includes('pie') ||
                          messageLower.includes('área') ||
                          messageLower.includes('area') ||
                          messageLower.includes('dispersión') ||
                          messageLower.includes('dispersion') ||
                          messageLower.includes('scatter') ||
                          messageLower.includes('radar') ||
                          messageLower.includes('araña') ||
                          messageLower.includes('treemap') ||
                          messageLower.includes('árbol') ||
                          messageLower.includes('embudo') ||
                          messageLower.includes('funnel') ||
                          messageLower.includes('combinada') ||
                          messageLower.includes('composed') ||
                          messageLower.includes('sankey') ||
                          messageLower.includes('ventas') ||
                          messageLower.includes('estadísticas') ||
                          messageLower.includes('estadisticas');

    if (isChartRequest) {
      console.log('mockApiCall: Chart request detected');
      
      // Determinar tipo de gráfica basado en palabras clave
      let chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'radar' | 'treemap' | 'funnel' | 'composed' | 'sankey' = 'bar';
      
      if (messageLower.includes('línea') || messageLower.includes('linea') || messageLower.includes('line')) {
        chartType = 'line';
      } else if (messageLower.includes('pie') || messageLower.includes('pastel') || messageLower.includes('torta')) {
        chartType = 'pie';
      } else if (messageLower.includes('área') || messageLower.includes('area')) {
        chartType = 'area';
      } else if (messageLower.includes('dispersión') || messageLower.includes('dispersion') || messageLower.includes('scatter')) {
        chartType = 'scatter';
      } else if (messageLower.includes('radar') || messageLower.includes('araña')) {
        chartType = 'radar';
      } else if (messageLower.includes('treemap') || messageLower.includes('árbol') || messageLower.includes('mapa')) {
        chartType = 'treemap';
      } else if (messageLower.includes('embudo') || messageLower.includes('funnel')) {
        chartType = 'funnel';
      } else if (messageLower.includes('combinada') || messageLower.includes('composed') || messageLower.includes('mixta')) {
        chartType = 'composed';
      }

      // Generar datos según el tipo de gráfica
      let chartData;
      
      if (chartType === 'pie') {
        chartData = {
          type: chartType,
          data: [
            { categoria: 'Ventas Online', valor: 3500, fill: '#0088FE' },
            { categoria: 'Ventas en Tienda', valor: 2800, fill: '#00C49F' },
            { categoria: 'Ventas Telefónicas', valor: 1200, fill: '#FFBB28' },
            { categoria: 'Ventas por Catálogo', valor: 800, fill: '#FF8042' },
            { categoria: 'Ventas Mayoristas', valor: 1500, fill: '#8884D8' }
          ],
          nameKey: 'categoria',
          valueKey: 'valor',
          title: 'Distribución de Ventas por Canal - Gráfica de Pie'
        };
      } else if (chartType === 'area') {
        chartData = {
          type: chartType,
          data: [
            { mes: 'Enero', ventas: 4500, ingresos: 6000 },
            { mes: 'Febrero', ventas: 5200, ingresos: 6800 },
            { mes: 'Marzo', ventas: 4800, ingresos: 6200 },
            { mes: 'Abril', ventas: 6100, ingresos: 7500 },
            { mes: 'Mayo', ventas: 5800, ingresos: 7200 },
            { mes: 'Junio', ventas: 6800, ingresos: 8400 }
          ],
          xKey: 'mes',
          yKey: 'ventas',
          title: 'Evolución de Ventas - Gráfica de Área'
        };
      } else if (chartType === 'scatter') {
        chartData = {
          type: chartType,
          data: [
            { precio: 100, ventas: 4500 },
            { precio: 120, ventas: 5200 },
            { precio: 80, ventas: 4800 },
            { precio: 150, ventas: 6100 },
            { precio: 110, ventas: 5800 },
            { precio: 130, ventas: 6800 },
            { precio: 90, ventas: 5100 },
            { precio: 140, ventas: 6200 }
          ],
          xKey: 'precio',
          yKey: 'ventas',
          title: 'Relación Precio vs Ventas - Gráfica de Dispersión'
        };
      } else if (chartType === 'radar') {
        chartData = {
          type: chartType,
          data: [
            { subject: 'Calidad', A: 120, B: 110, fullMark: 150 },
            { subject: 'Precio', A: 98, B: 130, fullMark: 150 },
            { subject: 'Servicio', A: 86, B: 130, fullMark: 150 },
            { subject: 'Marketing', A: 99, B: 100, fullMark: 150 },
            { subject: 'Innovación', A: 85, B: 90, fullMark: 150 },
            { subject: 'Logística', A: 65, B: 85, fullMark: 150 }
          ],
          nameKey: 'subject',
          radarKeys: ['A', 'B'],
          title: 'Comparación de Productos - Gráfica de Radar'
        };
      } else if (chartType === 'treemap') {
        chartData = {
          type: chartType,
          data: [
            { name: 'Electrónicos', size: 5000, fill: '#0088FE' },
            { name: 'Ropa', size: 3200, fill: '#00C49F' },
            { name: 'Hogar', size: 2800, fill: '#FFBB28' },
            { name: 'Deportes', size: 2200, fill: '#FF8042' },
            { name: 'Libros', size: 1500, fill: '#8884D8' },
            { name: 'Belleza', size: 1200, fill: '#82CA9D' }
          ],
          valueKey: 'size',
          title: 'Distribución de Ventas por Categoría - Mapa de Árbol'
        };
      } else if (chartType === 'funnel') {
        chartData = {
          type: chartType,
          data: [
            { name: 'Visitantes', value: 10000, fill: '#0088FE' },
            { name: 'Interesados', value: 5000, fill: '#00C49F' },
            { name: 'Carrito', value: 2000, fill: '#FFBB28' },
            { name: 'Checkout', value: 1000, fill: '#FF8042' },
            { name: 'Compra', value: 500, fill: '#8884D8' }
          ],
          valueKey: 'value',
          title: 'Embudo de Conversión - Gráfica de Embudo'
        };
      } else if (chartType === 'composed') {
        chartData = {
          type: chartType,
          data: [
            { mes: 'Enero', ventas: 4500, gastos: 2800, utilidad: 1700 },
            { mes: 'Febrero', ventas: 5200, gastos: 3100, utilidad: 2100 },
            { mes: 'Marzo', ventas: 4800, gastos: 2900, utilidad: 1900 },
            { mes: 'Abril', ventas: 6100, gastos: 3400, utilidad: 2700 },
            { mes: 'Mayo', ventas: 5800, gastos: 3200, utilidad: 2600 },
            { mes: 'Junio', ventas: 6800, gastos: 3700, utilidad: 3100 }
          ],
          xKey: 'mes',
          yKey: 'ventas',
          yKey2: 'gastos',
          title: 'Ventas y Gastos Mensuales - Gráfica Combinada'
        };
      } else {
        // Default bar/line chart
        chartData = {
          type: chartType,
          data: [
            { mes: 'Enero', ventas: 4500, gastos: 2800 },
            { mes: 'Febrero', ventas: 5200, gastos: 3100 },
            { mes: 'Marzo', ventas: 4800, gastos: 2900 },
            { mes: 'Abril', ventas: 6100, gastos: 3400 },
            { mes: 'Mayo', ventas: 5800, gastos: 3200 },
            { mes: 'Junio', ventas: 6800, gastos: 3700 }
          ],
          xKey: 'mes',
          yKey: 'ventas',
          title: chartType === 'bar' ? 'Ventas Mensuales - Gráfica de Barras' : 'Tendencia de Ventas - Gráfica de Líneas'
        };
      }

      const processingTime = Date.now() - startTime;
      
      let responseText = `He generado una gráfica de ${getChartTypeName(chartType)} basada en tu solicitud: "${message}"\n\n`;
      responseText += getChartDescription(chartType);

      return {
        text: responseText,
        chart: chartData,
        processingTime
      };
    }

    // Si no es una solicitud de gráfica, continuar con la lógica original
    console.log('mockApiCall: Making request to JSONPlaceholder API...');
    
    const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
    
    console.log('mockApiCall: Response status:', response.status);
    console.log('mockApiCall: Response ok:', response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts: JSONPlaceholderPost[] = await response.json();
    console.log('mockApiCall: API response data:', posts);
    
    const processingTime = Date.now() - startTime;
    
    // Crear respuesta basada en la pregunta
    let responseText = `He procesado tu consulta: "${message}"\n\n`;
    responseText += `Encontré ${posts.length} registros de ejemplo. Aquí tienes algunos datos de muestra:`;
    
    // Transformar datos para la tabla
    const tableData = {
      headers: ['ID', 'Usuario', 'Título', 'Contenido'],
      rows: posts.map(post => [
        post.id.toString(),
        `Usuario ${post.userId}`,
        post.title.substring(0, 30) + '...',
        post.body.substring(0, 50) + '...'
      ])
    };
    
    console.log('mockApiCall: Created table data:', tableData);
    
    // Generar enlace de descarga usando Lorem Picsum
    const imageId = Math.floor(Math.random() * 1000) + 1;
    const downloadLink = {
      url: `https://picsum.photos/800/600?random=${imageId}`,
      filename: `reporte_consulta_${Date.now()}.jpg`
    };
    
    console.log('mockApiCall: Generated download link:', downloadLink);
    
    return {
      text: responseText + `\n\n📎 He generado un reporte visual basado en tu consulta que puedes descargar.`,
      data: tableData,
      downloadLink,
      processingTime
    };
    
  } catch (error) {
    console.error('mockApiCall: Error:', error);
    
    const errorMessage = `❌ Error al conectar con el servicio: ${error instanceof Error ? error.message : 'Error desconocido'}. Por favor, inténtalo de nuevo.`;

    return {
      text: errorMessage,
      processingTime: Date.now() - startTime
    };
  }
};

// Helper functions
const getChartTypeName = (type: string): string => {
  const names: { [key: string]: string } = {
    'bar': 'barras',
    'line': 'líneas',
    'pie': 'pie',
    'area': 'área',
    'scatter': 'dispersión',
    'radar': 'radar',
    'treemap': 'mapa de árbol',
    'funnel': 'embudo',
    'composed': 'combinada',
    'sankey': 'Sankey'
  };
  return names[type] || type;
};

const getChartDescription = (type: string): string => {
  const descriptions: { [key: string]: string } = {
    'bar': 'La gráfica muestra datos de ventas mensuales usando barras verticales para facilitar la comparación.',
    'line': 'La gráfica muestra la tendencia de ventas a lo largo del tiempo con una línea continua.',
    'pie': 'La gráfica muestra la distribución porcentual de ventas por diferentes canales.',
    'area': 'La gráfica muestra la evolución de ventas con el área bajo la curva rellena para enfatizar la magnitud.',
    'scatter': 'La gráfica muestra la relación entre precio y ventas usando puntos dispersos.',
    'radar': 'La gráfica compara múltiples métricas en una forma circular tipo radar.',
    'treemap': 'La gráfica muestra la proporción de ventas por categoría usando rectángulos de diferentes tamaños.',
    'funnel': 'La gráfica muestra el proceso de conversión desde visitantes hasta compras.',
    'composed': 'La gráfica combina barras y líneas para mostrar ventas y gastos en una sola visualización.',
    'sankey': 'La gráfica muestra flujos de datos entre diferentes categorías.'
  };
  return descriptions[type] || 'Gráfica generada con datos de ejemplo.';
};
