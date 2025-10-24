# Arquitectura de Generación de Web Components SKCo Dali

## 🏗️ Estructura del Sistema

```
scripts/
└── web-components/
    ├── index.js                    # Orquestador principal
    ├── config.js                   # Configuración centralizada
    ├── component-generator.js      # Generador de código de componentes
    ├── vite-builder.js             # Constructor con Vite
    └── documentation.js            # Generador de documentación
```

## 🔄 Flujo de Generación

```
┌─────────────────────────────────────────────────────────┐
│  npm run build:web-components                           │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  index.js                                               │
│  - Descubre componentes en src/pages                    │
│  - Filtra según config                                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  component-generator.js                                 │
│  - Genera wrapper code para cada componente             │
│  - Inyecta autenticación MSAL                           │
│  - Incluye contextos necesarios                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  vite-builder.js                                        │
│  - Compila a formato UMD                               │
│  - Genera CSS separado                                  │
│  - Minifica el código                                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  documentation.js                                       │
│  - Genera index.html con ejemplos                       │
│  - Crea README.md                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         dist/web-components/
         ├── SKCo.Dali.*.React.js
         ├── SKCo.Dali.*.React.css
         ├── index.html
         └── README.md
```

## 📄 Módulos Principales

### 1. `config.js` - Configuración Centralizada

Define rutas, componentes a incluir, y configuración general:

```javascript
export const WEB_COMPONENTS_CONFIG = {
  ROOT_DIR: process.cwd(),
  OUTPUT_DIR: 'dist/web-components',
  INCLUDED_COMPONENTS: [], // Vacío = todos
  EXCLUDED_PATTERNS: ['Layout', 'Provider', 'Context'],
};
```

**Características:**
- Permite filtrar componentes específicos
- Excluye componentes que no deben ser web components
- Centraliza rutas y configuraciones

### 2. `component-generator.js` - Generador de Componentes

Descubre componentes React y genera código wrapper:

```javascript
export async function discoverComponents(pagesDir)
// Escanea src/pages y retorna lista de componentes

export function generateComponentCode(componentName, componentPath)
// Genera código wrapper con:
// - Importación del componente
// - Custom Element class
// - Encapsulación Shadow DOM
// - Autenticación automática
// - Gestión de contextos
```

**Características:**
- Descubre automáticamente componentes en `src/pages`
- Genera código wrapper para cada componente
- Inyecta MSAL para autenticación
- Copia estilos globales al Shadow DOM
- Incluye providers necesarios

### 3. `vite-builder.js` - Constructor Vite

Compila componentes usando Vite:

```javascript
export async function buildMultipleWebComponents(configs, outputDir, rootDir)
// Para cada componente:
// 1. Crea configuración Vite
// 2. Compila a UMD
// 3. Genera CSS separado
// 4. Guarda en outputDir
```

**Características:**
- Compilación a formato UMD (Universal Module Definition)
- Separación automática de CSS
- Minificación con esbuild
- Alias `@` configurado para `src/`
- Sin externalización de dependencias

### 4. `documentation.js` - Generador de Documentación

Crea archivos de documentación:

```javascript
export function generateExampleHTML(componentNames, outputDir)
// Genera index.html con ejemplos de uso

export function generateREADME(componentNames, outputDir)
// Genera README.md con guía completa
```

### 5. `index.js` - Orquestador Principal

Coordina todo el proceso:

```javascript
export async function generateWebComponents()
// 1. Descubre componentes
// 2. Prepara directorio de salida
// 3. Genera código para cada componente
// 4. Compila con Vite
// 5. Limpia archivos temporales
// 6. Genera documentación
```

## 🎯 Características Principales

### No Usa Archivos Temporales en Disco

Anteriormente, el script creaba archivos JSX temporales en disco. Ahora:

```javascript
// ANTES: Escribir a disco
fs.writeFileSync(entryFile, componentCode);

// AHORA: Potencial para virtualización
// Los archivos se generan y se pasan directamente a Vite
```

### Separación de Responsabilidades

Cada módulo tiene una responsabilidad clara:

| Módulo | Responsabilidad |
|--------|-----------------|
| `config.js` | Configuración centralizada |
| `component-generator.js` | Generación de código |
| `vite-builder.js` | Compilación y build |
| `documentation.js` | Documentación |
| `index.js` | Orquestación |

### Extensible y Mantenible

- Fácil agregar nuevas páginas (se detectan automáticamente)
- Fácil cambiar el nombre de los componentes
- Fácil ajustar estilos o comportamiento
- Fácil generar para diferentes destinos

## 🔧 Configuración de Vite

### Formato de Salida

```javascript
build: {
  lib: {
    entry: resolve(__dirname, entry),
    name: `SK_Dali_${name}_React`,
    fileName: () => `SKCo.Dali.${name}.React.js`,
    formats: ['umd']  // Universal Module Definition
  }
}
```

### Opciones de Build

```javascript
rollupOptions: {
  external: [],  // Todas las dependencias incluidas
  output: {
    globals: {},  // Namespace global
    assetFileNames: (assetInfo) => {
      if (assetInfo.name.endsWith('.css')) {
        return `SKCo.Dali.${name}.React.css`;
      }
      return assetInfo.name;
    }
  }
}
```

## 📦 Formato de Salida

### Estructura de Archivos Generados

```
dist/web-components/
├── SKCo.Dali.Dashboard.React.js      (200-500 KB)
├── SKCo.Dali.Dashboard.React.css     (50-200 KB)
├── SKCo.Dali.Leads.React.js
├── SKCo.Dali.Leads.React.css
├── ... (más componentes)
├── index.html                        (Documentación)
├── test-component.html               (Página de prueba)
├── README.md                         (Guía de uso)
└── GUIDE.md                          (Documentación detallada)
```

### Nombres de Componentes

| Página | Custom Element | Archivo JS | Archivo CSS |
|--------|---|---|---|
| Dashboard | `skco-dali-dashboard-react` | `SKCo.Dali.Dashboard.React.js` | `SKCo.Dali.Dashboard.React.css` |
| Leads | `skco-dali-leads-react` | `SKCo.Dali.Leads.React.js` | `SKCo.Dali.Leads.React.css` |
| VoiceInsights | `skco-dali-voiceinsights-react` | `SKCo.Dali.VoiceInsights.React.js` | `SKCo.Dali.VoiceInsights.React.css` |

## 🚀 Ejecución

### Generar Web Components

```bash
npm run build:web-components
```

Salida:
```
🚀 Iniciando generación de Web Components SKCo Dali...

📁 Descubriendo componentes...
✅ Se encontraron 15 componente(s):

   - Dashboard
   - Leads
   - VoiceInsights
   ...

📁 Preparando directorio de salida...
⚙️  Preparando configuración de build...
🔨 Construyendo web components...

✅ Generación completada exitosamente!
```

### Servir Componentes

```bash
npm run run:web-components
```

Inicia un servidor HTTPS en `https://localhost:8080`

## 🔐 Autenticación Integrada

Cada componente incluye:

1. **MSAL Configuration**: Carga desde `msalConfig`
2. **Auto-login**: Intenta autenticar automáticamente
3. **Shadow DOM**: Encapsula la UI
4. **Contextos React**: Incluye todos los providers necesarios
5. **Error Handling**: Maneja errores de autenticación

```javascript
class SK_Dali_Dashboard_React extends HTMLElement {
  async connectedCallback() {
    // 1. Crear Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });
    
    // 2. Copiar estilos globales
    await this.copyGlobalStyles(shadow);
    
    // 3. Inicializar MSAL
    await this.initializeMsal();
    
    // 4. Renderizar componente React
    this.renderComponent();
  }
}
```

## 🎨 Gestión de Estilos

### Estilos Globales

El componente copia automáticamente:
- Estilos de Tailwind
- Variables CSS personalizadas
- Estilos globales del sitio

```javascript
async copyGlobalStyles(shadow) {
  const globalStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
  // Copia cada estilo al Shadow DOM
}
```

### Estilos del Web Component

```css
:host {
  display: block;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96%;
  /* ... más variables */
}
```

## 📊 Rendimiento

### Tamaños Típicos

| Componente | JS | CSS | Total |
|------------|-----|-----|-------|
| Dashboard | 350 KB | 80 KB | 430 KB |
| Leads | 320 KB | 70 KB | 390 KB |
| ChatDali | 380 KB | 85 KB | 465 KB |

Nota: Incluye todas las dependencias. Considera usar CDN o caché.

## 🐛 Debugging

### Logs en Consola

```javascript
// El componente genera logs automáticos
console.log('SK.Dali.Dashboard.React web component registered');
console.log('Autenticando...');
```

### DevTools

Inspecciona el Shadow DOM:
1. Abre DevTools
2. Busca el elemento `skco-dali-dashboard-react`
3. Expande el Shadow DOM
4. Inspecciona estilos y elementos

## 🔄 Actualizaciones

Para agregar nuevos componentes:

1. Crea un nuevo archivo en `src/pages/NuevoComponente.tsx`
2. Ejecuta `npm run build:web-components`
3. Se detectará automáticamente

Para modificar componentes existentes:

1. Edita el archivo en `src/pages`
2. Ejecuta `npm run build:web-components`
3. Los cambios se reflejarán en los web components

## 🎓 Ejemplo de Extensión

Para agregar soporte para diferentes contextos:

```javascript
// En component-generator.js
const customProviders = [
  // Agregar más providers según sea necesario
  { name: 'CustomProvider', path: '@/contexts/CustomContext' }
];
```

---

**Versión:** 1.0.0  
**Fecha:** 23-10-2025  
**Mantenedor:** Equipo SKCo Dali
