
# 🚀 CRM Web Components

Este directorio contiene los scripts necesarios para generar web components standalone de las páginas principales del CRM.

## 📋 Componentes Disponibles

- **`<crm-leads>`** - Gestión de Leads
- **`<crm-chat-dali>`** - Chat DALI
- **`<crm-dashboard>`** - Dashboard principal
- **`<crm-informes>`** - Informes Power BI

## 🛠️ Generación de Web Components

### 1. Build de Producción

```bash
# Generar todos los web components
node scripts/build-web-components.js
```

Esto generará en `dist/web-components/`:
- `crm-web-components.es.js` - Versión ES Modules
- `crm-web-components.umd.js` - Versión UMD (compatible con navegadores antiguos)
- `crm-web-components.css` - Estilos necesarios

### 2. Uso en Proyectos Externos

#### Opción A: ES Modules (Recomendado)

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="./crm-web-components.css">
</head>
<body>
    <!-- Usar los componentes -->
    <crm-leads></crm-leads>
    <crm-chat-dali></crm-chat-dali>
    <crm-dashboard></crm-dashboard>
    <crm-informes></crm-informes>

    <script type="module">
        import { registerCRMWebComponents } from './crm-web-components.es.js';
        registerCRMWebComponents();
    </script>
</body>
</html>
```

#### Opción B: UMD (Navegadores antiguos)

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="./crm-web-components.css">
</head>
<body>
    <crm-leads></crm-leads>
    
    <script src="./crm-web-components.umd.js"></script>
    <script>
        // Los componentes se registran automáticamente
    </script>
</body>
</html>
```

## 🎛️ API de los Componentes

### Propiedades

Los web components pueden recibir propiedades a través del atributo `data-props`:

```html
<crm-leads data-props='{"initialFilter": "new"}'></crm-leads>
```

### Eventos Personalizados

Los componentes emiten eventos personalizados:

```javascript
const leadsComponent = document.querySelector('crm-leads');

leadsComponent.addEventListener('lead-created', (event) => {
    console.log('Nuevo lead:', event.detail);
});

leadsComponent.addEventListener('lead-updated', (event) => {
    console.log('Lead actualizado:', event.detail);
});
```

### Métodos Públicos

```javascript
const leadsComponent = document.querySelector('crm-leads');

// Actualizar propiedades
leadsComponent.updateProps({ filter: 'qualified' });

// Obtener estado
const state = leadsComponent.getComponentState();
```

## 🔧 Personalización

### Estilos CSS

Los web components usan Shadow DOM, por lo que los estilos están encapsulados. Para personalizar:

```css
/* Estilos del host */
crm-leads {
    width: 100%;
    height: 600px;
    border: 1px solid #ccc;
    border-radius: 8px;
}

/* Variables CSS para temas */
crm-leads {
    --primary-color: #your-color;
    --background-color: #your-bg;
}
```

### Variables de Entorno

Los componentes pueden configurarse con variables de entorno:

```javascript
// Antes de registrar los componentes
window.CRM_CONFIG = {
    apiUrl: 'https://your-api.com',
    authProvider: 'azure',
    theme: 'dark'
};

import { registerCRMWebComponents } from './crm-web-components.es.js';
registerCRMWebComponents();
```

## 📱 Responsive Design

Los web components son totalmente responsivos y se adaptan al contenedor:

```css
/* Móvil */
@media (max-width: 768px) {
    crm-leads {
        height: 100vh;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    crm-leads {
        height: 800px;
    }
}
```

## 🚀 Integración con Frameworks

### Vue.js

```vue
<template>
    <crm-leads 
        :data-props="JSON.stringify(leadsProps)"
        @lead-created="handleLeadCreated"
    />
</template>

<script>
export default {
    data() {
        return {
            leadsProps: { filter: 'new' }
        }
    },
    methods: {
        handleLeadCreated(event) {
            console.log(event.detail);
        }
    }
}
</script>
```

### Angular

```typescript
// app.component.ts
import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
    template: `
        <crm-leads 
            #leadsComponent
            [attr.data-props]="leadsPropsJson"
            (lead-created)="onLeadCreated($event)"
        ></crm-leads>
    `
})
export class AppComponent {
    @ViewChild('leadsComponent') leadsComponent!: ElementRef;
    
    leadsProps = { filter: 'new' };
    
    get leadsPropsJson() {
        return JSON.stringify(this.leadsProps);
    }
    
    onLeadCreated(event: CustomEvent) {
        console.log(event.detail);
    }
}
```

## 🐛 Debugging

### Habilitar Logs

```javascript
window.CRM_DEBUG = true;
```

### Inspector de Componentes

```javascript
// En la consola del navegador
const component = document.querySelector('crm-leads');
console.log('Estado:', component.getComponentState());
console.log('Props:', component.props);
```

## 📦 Distribución

Los archivos generados pueden ser distribuidos via:

- **CDN**: Subir a un CDN público
- **npm**: Crear un paquete npm
- **Descarga directa**: Incluir en repositorios

### Ejemplo CDN

```html
<script type="module">
    import { registerCRMWebComponents } from 'https://cdn.example.com/crm-web-components.es.js';
    registerCRMWebComponents();
</script>
```

## ⚠️ Consideraciones

1. **Tamaño**: Los web components incluyen React y todas las dependencias (~2MB gzipped)
2. **Compatibilidad**: Requiere navegadores modernos con soporte para Custom Elements
3. **Estado**: Cada instancia mantiene su propio estado
4. **Rendimiento**: Múltiples instancias pueden impactar el rendimiento

## 📞 Soporte

Para problemas o preguntas sobre los web components, revisar:
1. Los logs del navegador
2. La documentación de Custom Elements
3. Las herramientas de desarrollo de React
