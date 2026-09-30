# Tasks: Persistencia filtros en CRM contactos/leads (lista de marketing)

## 1. useTableManagement: preservar params en navegaciones

- [ ] 1.1 Añadir parámetro opcional `preserveParams` (objeto) a `useTableManagement`. Por defecto `{}`.
- [ ] 1.2 En `SearchFieldChanged`, antes de `router.get`, fusionar `preserveParams` con `updatedParams` (los preserve tienen prioridad baja: `{ ...updatedParams, ...preserveParams }` o al revés según se quiera que no se pisen; aquí queremos que preserveParams no se pierdan: `{ ...preserveParams, ...updatedParams }` podría pisar preserveParams con undefined; mejor `Object.assign({}, preserveParams, updatedParams)` o `{ ...preserveParams, ...updatedParams }` para que updatedParams pise solo lo que toque).
- [ ] 1.3 En `sortChanged`, fusionar `preserveParams` con el objeto que se pasa a `router.get`.
- [ ] 1.4 Revisar resto del hook: paginación, cambio de per_page, etc., y en toda llamada a `router.get` hacia la ruta índice fusionar `preserveParams`.

## 2. CrmContact/Index: pasar preserveParams en modo builder

- [ ] 2.1 En la llamada a `useTableManagement`, pasar `preserveParams: (isBuildingList && builderList) ? { marketing_list_id: builderList.id, build_marketing_list: 1 } : {}`.
- [ ] 2.2 Comprobar que el modal sigue recibiendo `filters={tableQueryParams}`; si en tu entorno los filtros ya no se pierden al crear lista, no hace falta cambiar el modal. Si se pierden, valorar pasar al modal una función que devuelva los params actuales en el submit.

## 3. Backend (verificación)

- [ ] 3.1 Confirmar que `MarketingListController::storeFromContacts` recibe `redirect_filters` y hace `array_merge($redirectFilters, ['marketing_list_id' => ..., 'build_marketing_list' => 1])` correctamente y que la redirección genera la URL esperada.
- [ ] 3.2 Si hace falta, normalizar tipos (p. ej. asegurar que valores numéricos o booleanos no se pierden en el merge).

## 4. Verificación

- [ ] 4.1 Flujo "filtrar → crear lista": aplicar filtros, abrir modal, crear lista; comprobar que la URL tras redirect incluye filtros y modo builder y que la tabla está filtrada.
- [ ] 4.2 Flujo "crear lista → filtrar": crear lista (sin filtros), aplicar un filtro; comprobar que la barra de construcción sigue visible y la URL tiene filtros + builder params.
- [ ] 4.3 Probar en `/admin/crm-contacts` y en `/admin/crm-leads`.
