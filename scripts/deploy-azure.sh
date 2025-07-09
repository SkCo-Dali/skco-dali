
#!/bin/bash

echo "🚀 Preparando despliegue para Azure Static Web Apps..."

# Verificar que estemos en la branch main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  Advertencia: No estás en la branch main"
    echo "Branch actual: $current_branch"
    read -p "¿Deseas continuar? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Instalando dependencias..."
npm ci

echo "🔨 Construyendo la aplicación..."
npm run build

echo "🧪 Ejecutando tests (si existen)..."
npm run test --if-present

echo "📋 Verificando archivos de configuración..."
if [ ! -f "staticwebapp.config.json" ]; then
    echo "❌ Error: staticwebapp.config.json no encontrado"
    exit 1
fi

if [ ! -f ".github/workflows/azure-static-web-apps.yml" ]; then
    echo "❌ Error: Workflow de GitHub Actions no encontrado"
    exit 1
fi

echo "✅ Build completado exitosamente"
echo "📁 Archivos generados en: ./dist"
echo ""
echo "📋 Próximos pasos:"
echo "1. Commit y push de los cambios a GitHub"
echo "2. Crear Azure Static Web App en el portal"
echo "3. Conectar con el repositorio de GitHub"
echo ""
echo "🔗 Documentación: Ver AZURE_DEPLOYMENT.md"
