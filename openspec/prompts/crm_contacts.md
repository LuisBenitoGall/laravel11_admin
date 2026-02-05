- 04/02/2026:

Objetivo: Implementar el change “2026-02-04_crm-contacts-filtros-avanzados” de forma EXPEDITIVA y ESTRICTA.

Fuente de verdad:
- openspec/changes/2026-02-04_crm-contacts-filtros-avanzados/proposal.md
- openspec/changes/2026-02-04_crm-contacts-filtros-avanzados/tasks.md

Alcance (solo filtros avanzados / adhoc):
- Añadir 2 filtros avanzados (adhoc) en /admin/crm-contacts y /admin/crm-leads:
  1) adhoc.cost_center_id (select)
     - Opciones: CostCenter where company_id = currentCompanyId AND status = 1
     - Filtrado: usuarios con registro en user_cost_centers donde company_id = currentCompanyId y cost_center_id = seleccionado
  2) adhoc.business_type (select)
     - Opciones: App\Concerns\HasBusinessTypes::comboOptions()
     - Filtrado: usuarios con algún crm_contacts (mismo company_id) con business_type = seleccionado (whereExists)

Restricciones:
- NO crear filtros de cabecera (query params directos fuera de adhoc).
- NO añadir columnas nuevas en la tabla/listado.
- Mantener el patrón existente:
  Backend: UserFilterRequest → CrmContactController::filteredData() → dataQuery() + adHocFilterDefinitions()
  Frontend: useTableManagement + formulario de filtros avanzados basado en adHocFilterUiConfig()
- Respetar multiempresa: siempre company_id = empresa en sesión.

Backend (mínimo):
- UserFilterRequest: aceptar adhoc.cost_center_id y adhoc.business_type (nullable|integer).
- CrmContactController:
  - adHocFilterDefinitions(): añadir closures apply para ambos filtros (cost_center_id via user_cost_centers; business_type via crm_contacts whereExists).
  - adHocFilterUiConfig(): añadir ambos selects con opciones correctas (cost centers filtrados + HasBusinessTypes).
  - activeFiltersLegend(): mostrar etiquetas legibles (business type desde HasBusinessTypes; cost center name por id + cache si procede).
  - NO tocar dataQuery salvo que sea imprescindible para no romper el pipeline actual.

Frontend:
- resources/js/Pages/Admin/CrmContact/Index.jsx (y/o componente del formulario adhoc):
  - Renderizar ambos selects desde la config devuelta por adHocFilterUiConfig().
  - Enviar valores como adhoc[business_type] y adhoc[cost_center_id].
  - Persistencia al paginar/ordenar y reset correcto al limpiar filtros.

Rendimiento:
- Verificar/añadir índices si faltan:
  user_cost_centers: company_id, user_id, cost_center_id (ideal compuesto)
  crm_contacts: company_id, user_id, business_type (ideal compuesto)

Entrega:
- Implementar y mostrar DIFF de los archivos tocados.
- Actualizar openspec/changes/2026-02-04_crm-contacts-filtros-avanzados/tasks.md marcando [x] SOLO cuando cumpla “Done”.
- Sin refactors laterales ni cambios de estilo no solicitados.
