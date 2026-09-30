# Design: Filtro de teléfono en tabla CRM contactos

## Context

- El listado usa `CrmContactController::filteredData()` con un array `$filters` que aplica filtros por `full_name`, `companies`, `email`, `position`, `contact_type`, `contact_subtype`, `categories`. Los parámetros llegan por query string desde el front (FilterRow + useTableManagement).
- La columna "Teléfonos" en `Index.jsx` tiene `key: 'phones'` y actualmente `filter: ''`. Los teléfonos se almacenan en la tabla `phones` (relación morph User → Phone), con campo `e164` para el número canónico.
- Filtros avanzados (adhoc) ya existen para otros criterios; este cambio solo afecta a los filtros de la tabla (cabecera).

## Goals / Non-Goals

**Goals:** Añadir un único filtro de texto en la columna Teléfonos de la tabla, aplicado en backend por coincidencia parcial sobre el número (e164).

**Non-Goals:** No modificar filtros avanzados; no cambiar la visualización de la columna; no añadir filtro por tipo de teléfono o WhatsApp.

## Decisions

### Decision 1: Parámetro y backend

- Usar el mismo key que la columna: `phones`. En el request vendrá `phones` (string opcional).
- En `filteredData()`, añadir al array `$filters` una entrada `'phones' => function ($q, $v) { ... }` que, si `$v` no está vacío, aplique `$q->whereHas('phones', fn($sub) => $sub->where('e164', 'like', "%{$v}%"))` (o equivalente seguro). Escapar/sanitizar el valor para LIKE si es necesario.
- La relación `users.phones` ya está disponible en el query base (User); no hace falta join adicional si whereHas usa la relación del modelo User.

### Decision 2: Frontend

- En `Index.jsx`, en la definición de la columna `phones`, cambiar `filter: ''` a `filter: 'text'`. El placeholder ya existe (`__('telefonos_filtrar')`). FilterRow y useTableManagement enviarán el parámetro `phones` en la query automáticamente.
