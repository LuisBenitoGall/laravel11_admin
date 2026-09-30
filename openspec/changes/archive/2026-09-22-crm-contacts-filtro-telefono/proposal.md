# Change: Incluir filtro de teléfono en listado CRM contactos (filtros de tabla)

## Why

En el listado de contactos CRM (/admin/crm-contacts) la columna "Teléfonos" no tiene filtro en la fila de filtros de la tabla. Los usuarios deben poder filtrar por número de teléfono sin tener que usar los filtros avanzados.

## What Changes

- Añadir filtro de tipo texto en la columna "Teléfonos" de la tabla de contactos CRM (filtros de cabecera/tabla, no filtros avanzados).
- Backend: aplicar filtro por teléfono (tabla `phones`, relación User → phones) cuando el parámetro de query esté presente.
- Frontend: activar el control de filtro en la columna `phones` (filter: 'text') y asegurar que el parámetro se envíe en la petición filtrada.

## Capabilities

### Modified Capabilities

- **crm-contacts-listado**: El listado de contactos CRM MUST ofrecer un filtro por teléfono en la fila de filtros de la tabla, que restringe los resultados a usuarios con al menos un teléfono cuyo número coincida (parcialmente) con el valor introducido.

## Impact

- `app/Http/Controllers/Admin/CrmContactController.php`: añadir entrada en el array de filtros para `phones` (whereHas sobre relación phones, búsqueda por e164 o número).
- `resources/js/Pages/Admin/CrmContact/Index.jsx`: cambiar la columna `phones` de `filter: ''` a `filter: 'text'` para mostrar el input en FilterRow.
