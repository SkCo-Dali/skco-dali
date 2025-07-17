
#!/bin/bash

# Script para deployar web components a Azure Static Web Apps

echo "🚀 Iniciando deploy de SK Dali Web Components..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
  echo "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
  exit 1
fi

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependencias..."
  npm install
fi

# Construir web components
echo "🔨 Construyendo web components..."
node scripts/build-web-components.js

# Verificar que la construcción fue exitosa
if [ ! -d "dist/web-components" ]; then
  echo "❌ Error: No se pudo construir los web components."
  exit 1
fi

echo "✅ Web components construidos exitosamente"

# Crear estructura para Azure Static Web Apps
echo "📁 Preparando estructura para Azure..."

# Copiar archivos necesarios
cp -r dist/web-components/* dist/
cp staticwebapp.config.json dist/ 2>/dev/null || echo "⚠️  staticwebapp.config.json no encontrado"

echo "🌐 Archivos listos para deploy en Azure Static Web Apps"
echo "📋 Archivos generados:"
ls -la dist/SK.Dali.*.React.*

echo "✅ Deploy preparado. Los archivos están listos en la carpeta 'dist/'"
echo "🔗 Puedes usar estos archivos en cualquier aplicación web que soporte custom elements"
