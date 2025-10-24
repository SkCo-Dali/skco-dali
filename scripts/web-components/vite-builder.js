import { defineConfig, build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import { WEB_COMPONENTS_CONFIG } from './config.js';

/**
 * Crea la configuración de Vite para un web component específico
 */
export function createWebComponentViteConfig(
  entry,
  componentName,
  outDir,
  rootDir,
  options = {}
) {
  // Merge con la configuración base de config.js
  const baseViteConfig = WEB_COMPONENTS_CONFIG.VITE_CONFIG;
  
  return defineConfig({
    plugins: [react()],
    define: {
      'process.env.NODE_ENV': JSON.stringify('production')
    },
    build: {
      lib: {
        entry: entry,
        name: `SK_Dali_${componentName}_React`,
        fileName: () => `SKCo.Dali.${componentName}.React.js`,
        formats: baseViteConfig.lib.formats || ['umd']
      },
      rollupOptions: {
        external: baseViteConfig.build?.rollupOptions?.external || [],
        output: {
          globals: {},
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return `SKCo.Dali.${componentName}.React.css`;
            }
            return assetInfo.name;
          }
        }
      },
      outDir: outDir,
      emptyOutDir: baseViteConfig.build?.emptyOutDir ?? false,
      cssCodeSplit: baseViteConfig.build?.cssCodeSplit ?? false,
      ...(baseViteConfig.build?.minify && { minify: baseViteConfig.build.minify }),
      ...(baseViteConfig.build?.sourcemap && { sourcemap: baseViteConfig.build.sourcemap }),
    },
    resolve: {
      alias: {
        '@': resolve(rootDir, 'src')
      }
    },
    ...options
  });
}

/**
 * Construye un web component individual
 */
export async function buildWebComponent(
  entry,
  componentName,
  outDir,
  rootDir
) {
  try {
    console.log(`  🔨 Construyendo ${componentName}...`);
    
    const config = createWebComponentViteConfig(
      entry,
      componentName,
      outDir,
      rootDir
    );
    
    await build(config);
    
    console.log(`  ✅ ${componentName} construido exitosamente`);
    
    return {
      success: true,
      component: componentName,
      jsFile: `SKCo.Dali.${componentName}.React.js`,
      cssFile: `SKCo.Dali.${componentName}.React.css`
    };
  } catch (error) {
    console.error(`  ❌ Error al construir ${componentName}:`, error.message);
    throw error;
  }
}

/**
 * Construye múltiples web components
 */
export async function buildMultipleWebComponents(
  components,
  outDir,
  rootDir
) {
  const results = [];
  
  for (const component of components) {
    try {
      const result = await buildWebComponent(
        component.entry,
        component.name,
        outDir,
        rootDir
      );
      results.push(result);
    } catch (error) {
      console.error(`Error al construir componente ${component.name}`);
      // Continuar con el siguiente componente
    }
  }
  
  return results;
}
