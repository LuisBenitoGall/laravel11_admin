# Change: Persistencia de filtros en CRM contactos/leads al crear lista de marketing

## Why

En el listado de contactos CRM (y leads) existe la acción "Nueva Lista de Marketing": se crea una lista y luego se seleccionan contactos con checkboxes para añadirlos. El flujo ideal es usar filtros (columnas y avanzados) para acotar el listado y luego "Seleccionar todos" para marcar solo los filtrados. Hoy ocurren dos fallos: (1) Si se filtra primero y luego se crea la lista, al crear los filtros desaparecen y se carga la lista completa. (2) Si se crea la lista primero y luego se aplica un filtro, al filtrar desaparece la cabecera/barra de construcción de la lista (modo builder). El usuario debe poder tanto filtrar y después crear la lista (conservando filtros tras el redirect) como crear la lista y después filtrar (conservando el modo builder en cada navegación).

## What Changes

- Al crear la lista desde el modal: asegurar que los filtros actuales del listado (queryParams) se envían al backend y que el redirect a la vista en modo builder incluye esos filtros en la URL, de modo que la lista mostrada siga siendo la filtrada.
- En la vista en modo builder (construir lista): asegurar que toda navegación a la misma vista (cambio de filtro, ordenación, página, etc.) preserve en la URL los parámetros de modo builder (`marketing_list_id`, `build_marketing_list`), de modo que la barra de "Seleccionar todos" / "Guardar miembros" no desaparezca.
- Aplicar el mismo comportamiento en CRM contactos y CRM leads (misma vista Index, mismo controlador).

## Capabilities

### Modified Capabilities

- **crm-contacts-listado-builder**: El listado de contactos/leads en modo "construir lista de marketing" MUST preservar los parámetros de builder en todas las navegaciones (filtros, ordenación, paginación) para que la cabecera de construcción no desaparezca.
- **crm-contacts-listado-builder**: Tras crear una nueva lista de marketing desde el modal, el redirect MUST incluir los filtros que el usuario tenía aplicados en el listado, de modo que la vista en modo builder muestre la misma lista filtrada y no la completa.

## Impact

- `resources/js/Hooks/useTableManagement.jsx`: aceptar parámetros opcionales que se fusionen en cada navegación (p. ej. `preserveParams` o `mergeParams`) para conservar modo builder.
- `resources/js/Pages/Admin/CrmContact/Index.jsx`: pasar a useTableManagement (o a las navegaciones) los params de builder cuando `isBuildingList` sea true; asegurar que el modal recibe los queryParams actuales.
- `resources/js/Components/modals/ModalMarketingListFromContacts.jsx`: ya envía `redirect_filters`; verificar que recibe los queryParams correctos en el submit.
- Backend `MarketingListController::storeFromContacts`: ya hace redirect con `redirect_filters`; verificar que la fusión con la URL es correcta.
- Afecta a `/admin/crm-contacts` y `/admin/crm-leads` (misma página Index).
