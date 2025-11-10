# Sistema de Onboarding - Integración con Backend

Este sistema de onboarding se integra con el backend de FastAPI + SQL Server para gestionar el wizard de bienvenida de nuevos usuarios.

## Arquitectura

### Componentes principales

1. **OnboardingProvider**: Componente proveedor que verifica si el usuario necesita completar el onboarding al autenticarse.
2. **WelcomeOnboardingModal**: Modal con el wizard de 5 pasos.
3. **Hooks**:
   - `useOnboarding`: Maneja el estado local y envío de datos al backend
   - `useInAppMessaging`: Gestiona mensajes in-app y eventos

### API Endpoints

#### 1. GET /api/inapp/messages

Obtiene mensajes in-app para determinar si mostrar el onboarding.

**Query params:**

- `context`: "login"
- `route`: ruta actual
- `app_version`: versión del frontend

**Response:**

```json
[{
  "id": "cmp_onboarding_welcome_v1",
  "type": "modal",
  "mandatory": true,
  "priority": 100,
  "title": "Queremos conocerte un poquito",
  "body": "Con estos datos personalizo tu experiencia en Dali.",
  "cta": { "label": "Continuar", "action": "none" },
  "frequency": { "type": "once_per_user" },
  "dismissible": false
}]
```

#### 2. GET /api/onboarding/available-actions

Obtiene acciones dinámicas según el rol del usuario.

**Response:**

```json
{
  "actions": [
    {
      "code": "DASHBOARD",
      "label": "Ver Dashboard",
      "route": "/dashboard",
      "icon": "LayoutDashboard",
      "description": "Métricas y resumen general"
    }
  ]
}
```

#### 3. POST /api/onboarding/welcome

Guarda los datos del wizard de bienvenida.

**Body:**

```json
{
  "preferredName": "Juan",
  "whatsapp": {
    "countryCode": "+57",
    "phone": "3109876543"
  },
  "socials": {
    "facebook": "https://facebook.com/juan.asesor",
    "instagram": "@juan.asesor",
    "linkedin": "https://linkedin.com/in/juan-asesor",
    "xTwitter": "@juan_asesor",
    "tiktok": "@juan.asesor"
  },
  "primaryAction": {
    "code": "LEADS",
    "route": "/leads"
  },
  "emailSignatureHtml": "<p>Juan Pérez<br/>Asesor Comercial<br/>+57 310 000 0000</p>",
  "singleWish": "Quisiera que..."
}
```

**Response:**

```json
{
  "success": true,
  "userId": "75e5bfc6-fa2b-4e0d-a047-7d4295363591",
  "onboardingCompleted": true
}
```

#### 4. POST /api/inapp/events

Registra eventos del sistema de mensajería (view, click, dismiss).

**Body:**

```json
{
  "message_id": "cmp_onboarding_welcome_v1",
  "event": "view",
  "context": "login",
  "route": "/informes"
}
```

## Flujo de integración

### 1. Al iniciar sesión

El `OnboardingProvider`:

1. Verifica si el usuario ya completó el onboarding (localStorage)
2. Llama a `/api/inapp/messages?context=login`
3. Si hay un mensaje obligatorio, registra un evento "view"
4. Muestra el `WelcomeOnboardingModal`

### 2. Durante el wizard

- **Paso 1**: Nombre preferido
- **Paso 2**: WhatsApp y redes sociales
- **Paso 3**: Firma de email (opcional)
- **Paso 4**: Acción primaria (cargada desde `/api/onboarding/available-actions`)
- **Paso 5**: Deseo único (opcional, máx 240 chars)

### 3. Al finalizar

1. Se envían los datos a `POST /api/onboarding/welcome`
2. Si es exitoso:
   - Se registra un evento "click"
   - Se marca como completado en localStorage
   - Se redirige al usuario a la ruta seleccionada

## Configuración

### Variables de entorno

La API de onboarding usa la misma base URL que el resto de las APIs del CRM, configurada en `src/config/environment.ts`:

```typescript
CRM_API_BASE_URL: import.meta.env.VITE_CRM_API_BASE_URL || 'https://skcodalilmdev.azurewebsites.net'
```

No se requiere configuración adicional.

### Integración en App.tsx

```tsx
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider';

function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        {/* resto de la app */}
      </OnboardingProvider>
    </AuthProvider>
  );
}
```

## Validaciones

### WhatsApp

- **Colombia (+57)**: 10 dígitos, debe iniciar con 3
- **Otros países**: 7-15 dígitos

### Campos requeridos

- Nombre preferido: 2-40 caracteres
- WhatsApp: país + número válido
- Acción primaria: debe seleccionar una opción

### Campos opcionales

- Redes sociales
- Firma de email (HTML)
- Deseo único (máx 240 caracteres)

## Formato de datos

### countryCode

Se envía el **dialCode** (ej: "+57"), no el código de país ISO (ej: "CO").

### emailSignatureHtml

Se envía el HTML generado por el RichTextEditor.

### primaryAction

Se envía tanto el `code` como la `route` seleccionados del endpoint de acciones disponibles.
