# Tasks: Incluir nuevos campos en filtros avanzados de contactos CRM

## Objetivo
Ampliar el **filtro avanzado (adhoc)** en:
- `/admin/crm-contacts`
- `/admin/crm-leads`

Añadiendo:
1) **Centro de coste** (`adhoc.cost_center_id`)
   - Fuente: relación usuario ↔ centros de coste via `user_cost_centers`
   - Opciones: `cost_centers` filtrando por `company_id = currentCompanyId` y `status = 1`
   - UI: `select` (single)

2) **Tipo de negocio** (`adhoc.business_type`)
   - Fuente: `crm_contacts.business_type` (int)
   - Opciones: `App\Concerns\HasBusinessTypes::comboOptions()`
   - UI: `select` (single)

**Importante:**
- Son **exclusivamente filtros avanzados** (adhoc).
- No se añaden como filtros de cabecera ni como columnas en la tabla.

Patrón a respetar:
- Backend: `UserFilterRequest` → `CrmContactController::filteredData()` → `dataQuery()` + `adHocFilterDefinitions()`
- Frontend: `useTableManagement` + componentes de tabla y formulario de filtros avanzados.

---

## Backend

### 1) Validación: `UserFilterRequest`
- [x] 1.1 Aceptar nuevos filtros dentro de `adhoc`:
  - [x] `adhoc.cost_center_id`: `nullable|integer`
  - [x] `adhoc.business_type`: `nullable|integer`

**Done (1):**
- Request acepta ambos campos sin romper filtros avanzados existentes.
- Se puede aplicar/limpiar sin errores 422.

---

### 2) Filtros avanzados: `CrmContactController::adHocFilterDefinitions(string|int $company_id)`
- [x] 2.1 Añadir filtro `business_type`:
  - rules: `nullable|integer`
  - apply: `whereExists` sobre `crm_contacts cc2`:
    - `cc2.user_id = users.id`
    - `cc2.company_id = $company_id`
    - `cc2.business_type = $v`
  - lógica: si un usuario tiene varios `crm_contacts`, se cumple si alguno coincide.
- [x] 2.2 Añadir filtro `cost_center_id`:
  - rules: `nullable|integer`
  - apply: filtrar usuarios vinculados en `user_cost_centers`:
    - `user_cost_centers.company_id = $company_id`
    - `user_cost_centers.cost_center_id = $v`
  - Implementación recomendada:
    - `whereExists` (para evitar dependencias de relación si no existe)
    - o `whereHas` si ya existe relación `User -> costCenters` (no obligatoria).

**Done (2):**
- Ambos filtros adhoc funcionan en `filteredData`.
- No se introducen duplicados ni se rompe la query base de CRM.

---

### 3) UI config: `CrmContactController::adHocFilterUiConfig()`
- [x] 3.1 Añadir campo select `business_type`:
  - `key`: `business_type`
  - `label`: `__('tipo_negocio')`
  - `type`: `select`
  - `multiple`: `false`
  - `options`: `HasBusinessTypes::comboOptions()`
- [x] 3.2 Añadir campo select `cost_center_id`:
  - `key`: `cost_center_id`
  - `label`: `__('centro_coste')`
  - `type`: `select`
  - `multiple`: `false`
  - `options`: lista de `CostCenter` para empresa en sesión:
    - `company_id = $company_id`
    - `status = 1`
  - Recomendación: encapsular en helper privado:
    - `costCenterOptionsForCompany($company_id)`

**Done (3):**
- `adHocFilterUiConfig()` devuelve ambos campos y opciones correctas (solo empresa en sesión).
- El frontend renderiza sin lógica especial.

---

### 4) Leyenda filtros activos: `CrmContactController::activeFiltersLegend(Request $request)`
- [x] 4.1 `adhoc.business_type`:
  - Convertir índice → etiqueta con `HasBusinessTypes` (map interno o helper).
  - Añadir entrada legible a la leyenda.
- [x] 4.2 `adhoc.cost_center_id`:
  - Resolver nombre del centro de coste por ID (filtrado por `company_id`).
  - Cachear siguiendo el patrón existente (similar a país/provincia/población si ya hay).

**Done (4):**
- La leyenda muestra etiquetas legibles (no IDs).
- Limpiar filtros limpia también la leyenda.

---

### 5) Datos auxiliares (si aplica) en `CrmContactController::index(Request $request)`
- [x] 5.1 Confirmar si el frontend consume opciones solo desde `adHocFilterUiConfig()`:
  - Si SÍ: no hace falta pasar props extra.
  - Si NO (caso raro): pasar `cost_centers` como props para construir opciones.
- [x] 5.2 Mantener comportamiento actual de contactos y leads (no tocar subset de leads).

**Done (5):**
- Los selects tienen opciones correctas para la empresa en sesión.
- No se rompe el render inicial de la vista.

---

## Frontend

### 6) `resources/js/Pages/Admin/CrmContact/Index.jsx`
- [x] 6.1 Asegurar que el formulario de filtros avanzados renderiza:
  - `business_type` (select)
  - `cost_center_id` (select)
  a partir de la config de `adHocFilterUiConfig()`.
- [x] 6.2 Confirmar envío de valores como:
  - `adhoc[business_type]`
  - `adhoc[cost_center_id]`
- [x] 6.3 Confirmar integración con `useTableManagement`:
  - persiste al paginar/ordenar
  - recarga vía `slug + '.filtered-data'`
  - “Limpiar filtros” resetea ambos campos

**Done (6):**
- Los nuevos filtros aparecen, aplican, persisten y se limpian correctamente.
- No hay bucles de navegación ni pérdida del estado del formulario.

---

### 7) Orden y UX del formulario de filtros avanzados
- [x] 7.1 Insertar campos en el orden recomendado:
  - ... Dirección
  - **Tipo de negocio**
  - **Centro de coste**
  - País / provincia / población / CP
- [x] 7.2 Asegurar consistencia visual con estilos actuales (sin inventos).

**Done (7):**
- Misma disposición/estética que el resto de filtros avanzados.
- UX coherente con el patrón ya implementado.

---

## Rendimiento / índices

### 8) Verificación de índices mínimos
- [x] 8.1 Confirmar índices (y crear migration si faltan):
  - `user_cost_centers.company_id`
  - `user_cost_centers.user_id`
  - `user_cost_centers.cost_center_id`
  - (ideal compuesto) `user_cost_centers(company_id, cost_center_id, user_id)` o similar
  - `crm_contacts.company_id`
  - `crm_contacts.user_id`
  - `crm_contacts.business_type`
  - (ideal compuesto) `crm_contacts(company_id, business_type, user_id)` o similar

**Done (8):**
- Filtros no penalizan perceptiblemente el listado con datos reales.
- No hay full scans evitables por falta de índices.

---

## QA / pruebas

### 9) Casos de prueba mínimos
- [x] 9.1 Contactos: `adhoc.business_type` filtra correctamente.
- [x] 9.2 Contactos: `adhoc.cost_center_id` filtra correctamente.
- [x] 9.3 Leads: repetir 9.1 y 9.2 respetando subset `contact_type = 'clp'`.
- [x] 9.4 Combinación con otros filtros existentes (ej. categorías + tipo contacto + nuevos).
- [x] 9.5 Leyenda: muestra etiqueta correcta para business_type y nombre de cost center.
- [x] 9.6 Reset: “Limpiar filtros” elimina ambos filtros y restaura listado base.

**Done (9):**
- No hay regresiones en filtros existentes.
- Leads/contactos se mantienen coherentes.
- Leyenda y UI siempre reflejan el estado real.

---

## Entregables
- `openspec/changes/2026-02-04_crm-contacts-filtros-avanzados/tasks.md`
- Cambios en:
  - `UserFilterRequest`
  - `CrmContactController`:
    - `adHocFilterDefinitions()`
    - `adHocFilterUiConfig()`
    - `activeFiltersLegend()`
    - (opcional) `index()` si hay que pasar props
  - Frontend `Admin/CrmContact/Index.jsx` y componente del filtro avanzado
  - Traducciones si faltan (`centro_coste`, `tipo_negocio`)
  - Migración de índices si procede
