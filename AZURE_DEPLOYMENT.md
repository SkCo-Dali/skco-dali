
# Despliegue en Azure Static Web Apps

## Configuración de Seguridad Implementada

### Headers de Seguridad HTTP
- **X-Content-Type-Options**: Previene ataques MIME sniffing
- **X-Frame-Options**: Protege contra clickjacking
- **X-XSS-Protection**: Activa protección XSS del navegador
- **Content-Security-Policy**: Política robusta de seguridad de contenido
- **Referrer-Policy**: Controla información del referrer
- **Permissions-Policy**: Restringe APIs sensibles del navegador

### Content Security Policy (CSP)
La CSP está configurada para permitir:
- Scripts de Microsoft Login y Skandia CDN
- Estilos de Google Fonts y Skandia CDN
- Conexiones a APIs de Skandia y Microsoft
- Imágenes de cualquier fuente HTTPS

## Pasos para el Despliegue

### 1. Preparar el repositorio en GitHub
```bash
git add .
git commit -m "Add Azure Static Web Apps configuration"
git push origin main
```

### 2. Crear Azure Static Web App
1. Ve al Portal de Azure
2. Busca "Static Web Apps"
3. Crea un nuevo recurso
4. Conecta con tu repositorio de GitHub
5. Configura:
   - **Build location**: `/`
   - **App location**: `/`
   - **Output location**: `dist`

### 3. Configurar Variables de Entorno (si las necesitas)
En el Portal de Azure, ve a tu Static Web App:
1. Configuración → Variables de entorno
2. Añade las variables necesarias para producción

### 4. Configurar Dominio Personalizado (opcional)
1. En tu Static Web App, ve a "Custom domains"
2. Añade tu dominio personalizado
3. Configura los registros DNS

## Estructura de Archivos de Configuración

- `staticwebapp.config.json`: Configuración principal de Azure Static Web Apps
- `.github/workflows/azure-static-web-apps.yml`: Pipeline de CI/CD
- `public/web.config`: Configuración alternativa para App Service
- Este archivo: Documentación de despliegue

## Monitoreo y Logs

Para monitorear tu aplicación:
1. Ve a Application Insights en Azure
2. Configura alertas para errores
3. Revisa métricas de rendimiento

## Seguridad Adicional

### Autenticación
La aplicación ya está configurada con Azure AD. En producción:
1. Verifica que las URLs de redirección estén actualizadas
2. Configura los scopes necesarios
3. Revisa las políticas de acceso

### HTTPS
Azure Static Web Apps proporciona HTTPS automáticamente.
Para dominios personalizados, el certificado SSL se genera automáticamente.

## Troubleshooting

### Error 404 en rutas
El archivo `staticwebapp.config.json` está configurado para manejar SPAs.
Todas las rutas no encontradas redirigen a `/index.html`.

### Problemas de CSP
Si encuentras errores de Content Security Policy:
1. Revisa la consola del navegador
2. Actualiza la política en `staticwebapp.config.json`
3. Redespliega la aplicación

### Performance
- Los archivos estáticos se sirven desde CDN global
- La aplicación está optimizada para carga rápida
- Usa compression automática
