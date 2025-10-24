import fs from 'fs';
import path from 'path';

/**
 * Genera un archivo HTML de ejemplo con documentación
 */
export function generateExampleHTML(components, outputDir) {
  const componentsList = components
    .map(c => `            <li><strong>${c}</strong>
              <ul>
                <li>SKCo.Dali.${c}.React.js</li>
                <li>SKCo.Dali.${c}.React.css</li>
              </ul>
            </li>`)
    .join('\n');
  
  const componentExamples = components
    .map(c => {
      const tagName = `skco-dali-${c.toLowerCase()}-react`;
      return `        <div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 4px;">
          <h3>${c} Component</h3>
          <p><strong>Custom Element:</strong> <code>&lt;${tagName}&gt;&lt;/${tagName}&gt;</code></p>
          <pre><code>&lt;!-- Cargar CSS --&gt;
&lt;link rel="stylesheet" href="./SKCo.Dali.${c}.React.css"&gt;

&lt;!-- Cargar JS (ESM Module) --&gt;
&lt;script type="module"&gt;
  import SKCoDali${c}React from './SKCo.Dali.${c}.React.js';
&lt;/script&gt;

&lt;!-- Usar el componente --&gt;
&lt;${tagName}&gt;&lt;/${tagName}&gt;</code></pre>
        </div>`;
    })
    .join('\n');
  
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SKCo Dali Web Components</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #222;
            margin-bottom: 10px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        
        h2 {
            margin-top: 30px;
            margin-bottom: 15px;
            color: #333;
        }
        
        h3 {
            margin-top: 15px;
            margin-bottom: 10px;
            color: #444;
        }
        
        ul {
            margin-left: 20px;
        }
        
        li {
            margin-bottom: 8px;
        }
        
        code {
            background-color: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            color: #d63384;
        }
        
        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 10px 0;
        }
        
        pre code {
            color: #333;
            padding: 0;
            background-color: transparent;
        }
        
        .section {
            margin: 30px 0;
            padding: 20px;
            background-color: #f9f9f9;
            border-left: 4px solid #007bff;
            border-radius: 4px;
        }
        
        .warning {
            background-color: #fff3cd;
            border-left-color: #ffc107;
        }
        
        .info {
            background-color: #d1ecf1;
            border-left-color: #17a2b8;
        }
        
        .success {
            background-color: #d4edda;
            border-left-color: #28a745;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background-color: #f0f0f0;
            font-weight: 600;
        }
        
        tr:hover {
            background-color: #f9f9f9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 SKCo Dali Web Components</h1>
        <p class="subtitle">Componentes React empaquetados como Web Components reutilizables</p>
        
        <div class="section info">
            <h3>ℹ️ Información General</h3>
            <p>Los siguientes componentes han sido generados automáticamente como Web Components (Custom Elements HTML5) que pueden ser utilizados en cualquier contexto.</p>
        </div>
        
        <h2>📦 Componentes Disponibles</h2>
        <ul>
${componentsList}
        </ul>
        
        <h2>🚀 Ejemplo de Uso</h2>
        <div class="section success">
${componentExamples}
        </div>
        
        <h2>📋 Tabla de Componentes</h2>
        <table>
            <thead>
                <tr>
                    <th>Componente</th>
                    <th>Custom Element</th>
                    <th>Archivo JavaScript</th>
                    <th>Archivo CSS</th>
                </tr>
            </thead>
            <tbody>
${components.map(c => `                <tr>
                    <td>${c}</td>
                    <td><code>skco-dali-${c.toLowerCase()}-react</code></td>
                    <td><code>SKCo.Dali.${c}.React.js</code></td>
                    <td><code>SKCo.Dali.${c}.React.css</code></td>
                </tr>`).join('\n')}
            </tbody>
        </table>
        
        <h2>⚙️ Características</h2>
        <div class="section">
            <ul>
                <li><strong>Shadow DOM:</strong> Encapsulación completa de estilos y estructura</li>
                <li><strong>Autenticación Azure AD:</strong> Integración con MSAL para autenticación automática</li>
                <li><strong>Providers:</strong> AuthProvider, QueryClientProvider, ThemeProvider, etc.</li>
                <li><strong>CSS Separado:</strong> Estilos independientes para cada componente</li>
                <li><strong>ESM Module:</strong> Formato ECMAScript Module para máxima compatibilidad moderna</li>
            </ul>
        </div>
        
        <h2>🔐 Autenticación</h2>
        <div class="section warning">
            <p><strong>Nota importante:</strong> Los componentes incluyen autenticación automática mediante Azure AD (MSAL). Al cargar un componente, se iniciará automáticamente el flujo de login si no hay una sesión activa.</p>
        </div>
        
        <h2>📝 Notas de Integración</h2>
        <div class="section">
            <ul>
                <li>Incluye estilos globales automáticamente en el Shadow DOM</li>
                <li>La autenticación se maneja internamente mediante MSAL</li>
                <li>Compatible con navegadores modernos que soportan Web Components y Shadow DOM</li>
                <li>Cada componente incluye QueryClient para gestión de estado</li>
                <li>BrowserRouter incluido para manejo de rutas</li>
            </ul>
        </div>
        
        <hr style="margin: 40px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
            Generado automáticamente por el script de construcción de Web Components
        </p>
    </div>
</body>
</html>`;

  try {
    fs.writeFileSync(path.join(outputDir, 'index.html'), html);
    return true;
  } catch (error) {
    console.error('Error al generar index.html:', error.message);
    return false;
  }
}

/**
 * Genera un archivo README con documentación
 */
export function generateREADME(components, outputDir) {
  const readme = `# SKCo Dali Web Components

Componentes React generados automáticamente como Web Components reutilizables.

## Componentes Disponibles

${components.map((c, i) => `### ${i + 1}. ${c}

\`\`\`html
<link rel="stylesheet" href="./SKCo.Dali.${c}.React.css">
<script src="./SKCo.Dali.${c}.React.js"><\/script>

<skco-dali-${c.toLowerCase()}-react><\/skco-dali-${c.toLowerCase()}-react>
\`\`\``).join('\n\n')}

## Características

- ✅ Shadow DOM para encapsulación de estilos
- ✅ Autenticación automática con Azure AD (MSAL)
- ✅ Providers incluidos (Auth, Query, Theme, Settings, etc.)
- ✅ Estilos CSS separados para cada componente
- ✅ ESM Module para máxima compatibilidad moderna

## Uso Básico

1. Incluye el CSS del componente:
   \`\`\`html
   <link rel="stylesheet" href="./SKCo.Dali.{ComponentName}.React.css">
   \`\`\`

2. Carga el JavaScript (ESM Module):
   \`\`\`html
   <script type="module">
     import SKCoDali{ComponentName}React from './SKCo.Dali.{ComponentName}.React.js';
   <\/script>
   \`\`\`

3. Usa el custom element:
   \`\`\`html
   <skco-dali-{component-name}-react><\/skco-dali-{component-name}-react>
   \`\`\`

## Autenticación

Los componentes manejan automáticamente la autenticación mediante Azure AD. Al cargar un componente:

1. Se verifica si el usuario ya tiene una sesión activa
2. Si no, se inicia automáticamente el flujo de login
3. Se valida el token y el dominio del email
4. Se busca o crea el usuario en la base de datos

## API Pública

Cada componente expone la siguiente API:

### getComponentInfo()
Retorna información del componente:
\`\`\`javascript
const element = document.querySelector('skco-dali-leads-react');
const info = element.getComponentInfo();
// {
//   name: 'SKCo.Dali.Leads.React',
//   version: '1.0.0',
//   authenticated: true,
//   isConnected: true
// }
\`\`\`

### forceReauth()
Fuerza una re-autenticación:
\`\`\`javascript
const element = document.querySelector('skco-dali-leads-react');
await element.forceReauth();
\`\`\`

## Arquitectura

\`\`\`
Shadow DOM
├── Container (React Root)
├── Global Styles (copiados del documento)
└── Host Styles (CSS variables y animaciones)
    └── React Component Tree
        ├── QueryClientProvider
        ├── AuthProvider (+ MSAL)
        ├── BrowserRouter
        ├── ThemeProvider
        ├── SettingsProvider
        ├── NotificationProvider
        ├── SimpleConversationProvider
        └── AutoAuthWrapper
            └── Componente de página
\`\`\`

## Compatibilidad

- Chrome 85+
- Firefox 80+
- Safari 16.4+
- Edge 85+

## Notas Importantes

⚠️ Los componentes requieren que los estilos globales estén presentes en el documento principal.

⚠️ La autenticación se ejecuta automáticamente, asegúrate de que tus políticas CORS estén configuradas correctamente.

⚠️ Cada instancia del componente es completamente independiente (Shadow DOM encapsulado).

## Estructura de Archivos Generados

\`\`\`
dist/web-components/
├── SKCo.Dali.{ComponentName}.React.js
├── SKCo.Dali.{ComponentName}.React.css
└── index.html (documentación)
\`\`\`

---

Generado automáticamente. No edites estos archivos manualmente.
`;

  try {
    fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
    return true;
  } catch (error) {
    console.error('Error al generar README.md:', error.message);
    return false;
  }
}
