# Especificación Técnica: Endpoint Preview-From-Opportunity

## Información General

| Campo | Valor |
|-------|-------|
| **Endpoint** | `POST /leads/preview-from-opportunity` |
| **Query Parameter** | `opportunity_id` (integer, requerido) |
| **Headers Requeridos** | `Authorization: Bearer {token}`, `Content-Type: application/json` |
| **Método HTTP** | POST |

---

## Propósito

Este endpoint permite previsualizar los clientes de una oportunidad **antes** de cargarlos como leads. El objetivo principal es:

1. Mostrar al usuario los datos de cada cliente de la oportunidad
2. **Identificar qué clientes ya existen como leads en el sistema** para evitar duplicados

---

## Request

```http
POST {{base_url}}/leads/preview-from-opportunity?opportunity_id=123
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `opportunity_id` | integer | Sí | ID de la oportunidad a previsualizar |

---

## Response

### Estructura de Respuesta Exitosa (200 OK)

```json
[
  {
    "id": "lead-uuid-12345",          // ← CRÍTICO: ID del lead existente o null
    "CreatedBy": "advisor@company.com",
    "name": "Juan Pérez García",
    "email": "juan.perez@email.com",
    "phone": "+573001234567",
    "documentNumber": 1234567890,
    "company": null,
    "source": "Market Dali",
    "campaign": null,
    "product": [],
    "stage": "nuevo",
    "priority": "media",
    "value": 0,
    "assignedTo": "advisor@company.com",
    "nextFollowUp": null,
    "notes": null,
    "tags": [],
    "DocumentType": "CC",
    "SelectedPortfolios": [],
    "CampaignOwnerName": null,
    "Age": 35,
    "Gender": "M",
    "PreferredContactChannel": null,
    "AdditionalInfo": {
      "productosActuales": ["Cuenta de ahorros"],
      "segmento": "Premium"
    },
    "OpportunityId": 123
  },
  {
    "id": null,                        // ← null indica que NO existe como lead
    "CreatedBy": "advisor@company.com",
    "name": "María López Rodríguez",
    "email": "maria.lopez@email.com",
    "phone": "+573009876543",
    "documentNumber": 9876543210,
    "company": null,
    "source": "Market Dali",
    "campaign": null,
    "product": [],
    "stage": "nuevo",
    "priority": "media",
    "value": 0,
    "assignedTo": "advisor@company.com",
    "nextFollowUp": null,
    "notes": null,
    "tags": [],
    "DocumentType": "CC",
    "SelectedPortfolios": [],
    "CampaignOwnerName": null,
    "Age": 42,
    "Gender": "F",
    "PreferredContactChannel": null,
    "AdditionalInfo": {
      "productosActuales": ["Tarjeta de crédito"],
      "segmento": "Estándar"
    },
    "OpportunityId": 123
  }
]
```

---

## Campo `id` - Especificación Crítica

### Lógica de Negocio Requerida

El campo `id` es **el más importante** de la respuesta. El backend debe implementar la siguiente lógica:

```
PARA CADA cliente en la oportunidad:
    1. Buscar en la tabla de leads un registro donde:
       - documentNumber == cliente.documentNumber
       - (Opcional) DocumentType == cliente.DocumentType
    
    2. SI existe un lead con ese documento:
       → Retornar id = lead.id (el UUID/identificador del lead existente)
    
    3. SI NO existe un lead con ese documento:
       → Retornar id = null
```

### Pseudocódigo del Backend

```csharp
public async Task<List<PreviewLeadDto>> PreviewLeadsFromOpportunity(int opportunityId)
{
    // 1. Obtener clientes de la oportunidad
    var opportunityClients = await GetClientsFromOpportunity(opportunityId);
    
    var result = new List<PreviewLeadDto>();
    
    foreach (var client in opportunityClients)
    {
        // 2. Buscar si ya existe como lead
        var existingLead = await _leadsRepository.FindByDocumentNumber(client.DocumentNumber);
        
        // 3. Construir respuesta con id apropiado
        result.Add(new PreviewLeadDto
        {
            id = existingLead?.Id,  // UUID si existe, null si no existe
            name = client.Name,
            email = client.Email,
            phone = client.Phone,
            documentNumber = client.DocumentNumber,
            // ... resto de campos
        });
    }
    
    return result;
}
```

---

## Comportamiento Esperado en el Frontend

| Valor de `id` | Interpretación | Acción en UI |
|---------------|----------------|--------------|
| `"uuid-12345..."` (string válido) | Cliente ya existe como lead | Mostrar botón "Ver Lead" que navega a `/leads?edit={id}` |
| `null` | Cliente no existe como lead | Mostrar botón "Agregar al carrito" |

### Código Frontend Actual

```typescript
// src/services/marketDaliApi.ts - Línea ~75
const transformClient = (lead: PreviewLeadFromOpportunity): MarketClient => {
  return {
    id: lead.id || `temp-${lead.documentNumber}`,  // ← Genera ID temporal si id es null
    // ...
  };
};

// src/components/market-dali/ClientCard.tsx
const isClientAlreadyLoaded = (client: MarketClient): boolean => {
  return client.id != null && 
         client.id.trim() !== '' && 
         !client.id.startsWith('temp-');  // ← Detecta si es ID real vs temporal
};
```

---

## Casos de Prueba

### Caso 1: Oportunidad con clientes mixtos

**Escenario**: Oportunidad ID=123 tiene 3 clientes. 2 ya fueron cargados como leads previamente.

**Request**:
```http
POST /leads/preview-from-opportunity?opportunity_id=123
```

**Response esperada**:
```json
[
  { "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890", "documentNumber": 111111, "name": "Cliente Ya Cargado 1", ... },
  { "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901", "documentNumber": 222222, "name": "Cliente Ya Cargado 2", ... },
  { "id": null, "documentNumber": 333333, "name": "Cliente Nuevo", ... }
]
```

**Resultado en UI**:
- Cliente 111111: Muestra indicador "Ya cargado" + botón "Ver Lead"
- Cliente 222222: Muestra indicador "Ya cargado" + botón "Ver Lead"
- Cliente 333333: Muestra botón "Agregar al carrito"

### Caso 2: Oportunidad sin clientes previamente cargados

**Response esperada**:
```json
[
  { "id": null, "documentNumber": 444444, "name": "Cliente A", ... },
  { "id": null, "documentNumber": 555555, "name": "Cliente B", ... }
]
```

### Caso 3: Oportunidad con todos los clientes ya cargados

**Response esperada**:
```json
[
  { "id": "uuid-1", "documentNumber": 666666, "name": "Cliente X", ... },
  { "id": "uuid-2", "documentNumber": 777777, "name": "Cliente Y", ... }
]
```

**Resultado en UI**: Botón "Agregar todos" se oculta o muestra "0 clientes disponibles"

---

## Consideraciones de Performance

### Optimización Sugerida

En lugar de hacer N queries individuales, usar una consulta batch:

```sql
-- Obtener todos los leads existentes para los documentNumbers de la oportunidad
SELECT id, documentNumber 
FROM Leads 
WHERE documentNumber IN (111111, 222222, 333333, ...)
```

Luego hacer un LEFT JOIN o merge en memoria para asignar los IDs.

---

## Errores Comunes a Evitar

| Error | Problema | Solución |
|-------|----------|----------|
| Siempre retornar `id: null` | El frontend no puede detectar duplicados | Implementar la búsqueda en tabla Leads |
| Retornar string vacío `""` | El frontend lo interpreta incorrectamente | Usar explícitamente `null` |
| No incluir campo `id` | El frontend genera error | Siempre incluir el campo, aunque sea `null` |

---

## Resumen de Cambios Requeridos en Backend

1. **Modificar** el endpoint `POST /leads/preview-from-opportunity`
2. **Agregar** lógica de búsqueda en tabla Leads por `documentNumber`
3. **Retornar** el `id` del lead existente o `null` si no existe
4. **Mantener** todos los demás campos de la respuesta sin cambios

---

## Contacto

Para dudas sobre esta especificación, contactar al equipo de frontend que consume este endpoint.
