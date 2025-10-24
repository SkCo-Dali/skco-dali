import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { discoverComponents, generateComponentCode } from './component-generator.js';
import { buildMultipleWebComponents } from './vite-builder.js';
import { generateExampleHTML, generateREADME } from './documentation.js';
import { WEB_COMPONENTS_CONFIG } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Genera web components desde componentes React en src/pages
 */
export async function generateWebComponents() {
  try {
    console.log('\n🚀 Iniciando generación de Web Components SKCo Dali...\n');
    
    // Configuración
    const config = WEB_COMPONENTS_CONFIG;
    const pagesDir = path.join(config.ROOT_DIR, 'src/pages');
    const outputDir = config.OUTPUT_DIR;
    
    // Paso 1: Descubrir componentes
    console.log('📁 Descubriendo componentes...');
    let components = await discoverComponents(pagesDir);
    
    if (components.length === 0) {
      console.warn('⚠️  No se encontraron componentes en', pagesDir);
      return;
    }
    
    // Filtrar componentes si está especificado en config
    if (config.INCLUDED_COMPONENTS.length > 0) {
      components = components.filter(c =>
        config.INCLUDED_COMPONENTS.includes(c.name)
      );
    }
    
    // Excluir componentes especificados
    if (config.EXCLUDED_COMPONENTS && config.EXCLUDED_COMPONENTS.length > 0) {
      components = components.filter(c =>
        !config.EXCLUDED_COMPONENTS.includes(c.name)
      );
    }
    
    console.log(`✅ Se encontraron ${components.length} componente(s):\n`);
    components.forEach(c => console.log(`   - ${c.name}`));
    console.log();
    
    // Paso 2: Crear directorio de salida
    console.log('📁 Preparando directorio de salida...');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`   ✅ Directorio creado: ${outputDir}`);
    } else {
      console.log(`   ✅ Directorio existente: ${outputDir}`);
    }
    console.log();
    
    // Paso 3: Generar configuración de build para cada componente
    console.log('⚙️  Preparando configuración de build...\n');
    const buildConfigs = components.map(component => {
      // Generar código del componente en memoria (sin guardar a disco)
      // Usar ruta absoluta al componente
      const componentCode = generateComponentCode(
        component.name,
        component.path
      );
      
      // Crear un entry point virtual que será usado por Vite
      // Vamos a crear un archivo temporal solo para este propósito
      const entryFile = path.join(__dirname, `./.temp-entry-${component.name}.jsx`);
      fs.writeFileSync(entryFile, componentCode);
      
      return {
        name: component.name,
        entry: entryFile,
        tempFile: entryFile
      };
    });
    
    // Paso 4: Construir web components
    console.log('🔨 Construyendo web components...\n');
    const buildResults = await buildMultipleWebComponents(
      buildConfigs,
      outputDir,
      config.ROOT_DIR
    );
    
    // Paso 5: Limpiar archivos temporales
    console.log('\n🧹 Limpiando archivos temporales...');
    buildConfigs.forEach(config => {
      try {
        if (fs.existsSync(config.tempFile)) {
          fs.unlinkSync(config.tempFile);
        }
      } catch (error) {
        console.error(`   Error al limpiar ${config.tempFile}:`, error.message);
      }
    });
    console.log('   ✅ Archivos temporales eliminados\n');
    
    // Paso 6: Generar documentación
    console.log('📝 Generando documentación...');
    const componentNames = buildResults
      .filter(r => r.success !== false)
      .map(r => r.component);
    
    const htmlGenerated = generateExampleHTML(componentNames, outputDir);
    const readmeGenerated = generateREADME(componentNames, outputDir);
    
    if (htmlGenerated) console.log('   ✅ index.html generado');
    if (readmeGenerated) console.log('   ✅ README.md generado');
    console.log();
    
    // Paso 7: Resumen final
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ Generación completada exitosamente!');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📦 Web Components generados:\n');
    buildResults.forEach(result => {
      if (result.success !== false) {
        console.log(`  ✨ ${result.component}`);
        console.log(`     └─ ${result.jsFile}`);
        console.log(`     └─ ${result.cssFile}`);
      }
    });
    console.log();
    
    console.log(`📁 Ubicación: ${path.relative(process.cwd(), outputDir)}`);
    console.log(`📖 Documentación: ${path.relative(process.cwd(), path.join(outputDir, 'index.html'))}`);
    console.log();
    
    return {
      success: true,
      components: componentNames,
      outputDir: outputDir,
      count: buildResults.length
    };
    
  } catch (error) {
    console.error('\n❌ Error fatal:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateWebComponents();
}

export default generateWebComponents;
