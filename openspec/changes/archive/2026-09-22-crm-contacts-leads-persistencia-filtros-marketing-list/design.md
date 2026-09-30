# Design: Persistencia filtros y modo builder en CRM contactos/leads

## Context

- La vista `CrmContact/Index.jsx` sirve tanto para `/admin/crm-contacts` como para `/admin/crm-leads` (prop `slug` y `leads`). Usa `useTableManagement` con `indexRoute: slug + '.index'` y sin `routeParams` adicionales.
- El modal "Nueva Lista de Marketing" recibe `filters={tableQueryParams}` y envía `redirect_filters` al backend. El backend hace `redirect()->route('crm-contacts.index', array_merge($redirectFilters, ['marketing_list_id' => ..., 'build_marketing_list' => 1]))`.
- Cuando se aplica un filtro, `useTableManagement` llama a `router.get(route(indexRoute), updatedParams)`. Si no se incluyen en `updatedParams` los parámetros de builder que están en la URL actual, la nueva URL los pierde y la vista deja de recibir `builderMode`/`builderList`.
- `SearchFieldChanged` construye `updatedParams` desde `localQueryParams` (estado local), que se inicializa con `queryParams` del servidor. Tras el primer load en modo builder, `queryParams` incluye `marketing_list_id` y `build_marketing_list`, por lo que en teoría `localQueryParams` los tendría. El fallo puede estar en que `localQueryParams` no se sincroniza con la URL cuando esta llega por redirect (Inertia puede no actualizar el estado inicial en algún caso), o en que `sortChanged` y otras rutas usan `queryParams` en lugar de `localQueryParams` y en algún flujo se pierden.

## Goals / Non-Goals

**Goals:** (1) Redirect tras crear lista incluya siempre los filtros actuales. (2) En modo builder, toda navegación a la misma vista preserve `marketing_list_id` y `build_marketing_list`.

**Non-Goals:** No cambiar el flujo del modal ni la estructura de rutas; no tocar otros listados (users, contacts).

## Decisions

### Decision 1: Parámetros a preservar en navegaciones (modo builder)

- En `CrmContact/Index`, cuando `isBuildingList` es true, definir un objeto fijo de params a preservar: `{ marketing_list_id: builderList?.id, build_marketing_list: 1 }`. Estos deben ir en toda petición a la ruta índice (filtros, ordenación, paginación).
- Opción A: Extender `useTableManagement` con un argumento opcional `preserveParams` (objeto). En cada `router.get(route(indexRoute), params)` el hook fusiona `params` con `preserveParams` antes de enviar. Así no se duplica lógica en cada llamada a `router.get`.
- Opción B: En la página, no usar el `indexRoute` genérico para las navegaciones cuando estamos en builder; en su lugar, construir la URL con los params de builder + params de tabla. Eso exigiría pasar callbacks o sobreescribir el comportamiento del hook solo para esta página.
- **Elegida: Opción A.** Añadir a `useTableManagement` un parámetro opcional `preserveParams: {}`. En `SearchFieldChanged`, `sortChanged` y en cualquier otra llamada a `router.get` hacia la ruta índice, hacer `params = { ...preserveParams, ...params }` (o similar) antes de enviar. En `CrmContact/Index`, pasar `preserveParams: isBuildingList && builderList ? { marketing_list_id: builderList.id, build_marketing_list: 1 } : {}`.

### Decision 2: Envío de filtros al crear la lista

- El modal ya recibe `filters={tableQueryParams}`. Los `tableQueryParams` vienen de `useTableManagement` (`queryParams` / estado que refleja la URL). Para que tras filtrar y abrir el modal tengamos los filtros actuales, basta con que el padre pase `tableQueryParams` al modal; en Inertia, tras cada navegación el servidor devuelve nuevos props y `table.queryParams` se actualiza. Por tanto, al abrir el modal después de filtrar, `tableQueryParams` debería ser el correcto. Como medida de robustez, se puede pasar al modal una función que lea los params actuales en el momento del submit (p. ej. `getFiltersForRedirect={() => tableQueryParams}`) y que el modal llame a esa función al confirmar, en lugar de usar `filters` capturado en el render. Si con `filters={tableQueryParams}` sigue fallando, implementar esa variante.
- Backend: ya hace `array_merge($redirectFilters, [...])`. Verificar que los keys de `redirect_filters` son los esperados (query string) y que no se pierden por validación o tipo.

### Decision 3: Sincronizar estado local con URL en modo builder

- Asegurar que cuando la página se carga con modo builder (URL con `marketing_list_id` y `build_marketing_list`), el estado inicial `localQueryParams` en `useTableManagement` incluya esos params. Eso depende de que `queryParams` (que viene de `table.queryParams` del servidor) los tenga. El controlador ya pasa `'queryParams' => request()->query()`, por lo que la URL completa (incluidos builder) debería estar en `queryParams`. No debería ser necesario tocar el backend para esto si el front aplica Decision 1.

### Decision 4: sortChanged y demás usos de queryParams

- En `useTableManagement`, `sortChanged` actualmente usa `...queryParams` para construir el objeto que envía. Si `preserveParams` está definido, fusionarlo también ahí. Así, si por cualquier razón `queryParams` no tuviera los de builder en un re-render, `preserveParams` los añadiría. Revisar cualquier otra llamada a `router.get` hacia la ruta índice (paginación, per_page, etc.) y aplicar la misma fusión con `preserveParams`.
