# Change: Incluir nuevos campos en filtros avanzados de contactos CRM

## Summary

Mejorar y ampliar los filtros avanzados en las vistas de contactos CRM
(`/admin/crm-contacts`) y leads (`/admin/crm-leads`), añadiendo:

1. **Centro de coste**  
   - Fuente: relación `user_cost_centers` (contactos vinculados a centros de coste).  
   - Control de interfaz: `select` (listado de centros de coste disponibles para la empresa en sesión).  

2. **Tipo de negocio**  
   - Fuente: campo `crm_contacts.business_type` (entero).  
   - El valor corresponde al índice de un array de opciones definido en `App\Concerns\HasBusinessTypes`.  
   - Control de interfaz: `select` con las etiquetas generadas a partir de `HasBusinessTypes`.

Los nuevos filtros deben integrarse en el filtro avanzado de contactos respetando el patrón actual
de filtrado:

- backend: `UserFilterRequest` → `CrmContactController::filteredData()` → `dataQuery()` + `adHocFilterDefinitions()`,
- frontend: `useTableManagement` + componentes de tabla y formulario de filtros avanzados.

---

## Contexto actual

- La vista de **Contactos CRM** y **Leads** consume datos desde `CrmContactController@index`,
  que delega la construcción del listado en `dataQuery(Request $request)`.  
- `dataQuery` devuelve un `Builder` de `User` con:
  - joins a `user_companies`, `crm_accounts`, `crm_contacts` y relaciones cargadas (`avatar`, `phones`, `categories`, `companies`),
  - filtros actuales (nombre + apellidos, email, teléfonos, categorías, posición, tipo de contacto, fechas, etc.).
- El filtrado avanzado se resuelve en backend mediante:
  - `UserFilterRequest` (validación de filtros de cabecera y filtros adhoc),
  - `CrmContactController::filteredData()` (aplica filtros y devuelve JSON),
  - `CrmContactController::adHocFilterDefinitions()` (reglas y closures `apply` de los filtros avanzados),
  - `CrmContactController::adHocFilterUiConfig()` (configuración de UI de los filtros avanzados),
  - `CrmContactController::activeFiltersLegend()` (texto de leyenda para filtros activos).

En frontend, el filtrado se articula a través de:

- configuración de columnas y filtros en `Admin/CrmContact/Index.jsx`,
- `FilterRow` + `useTableManagement` (`SearchFieldChanged`, query params),
- el formulario de filtros avanzados que consume la configuración devuelta por `adHocFilterUiConfig()`,
- el endpoint `slug + '.filtered-data'` que devuelve `UserResource::collection(...)`.

Nuevas piezas ya existentes que se quieren aprovechar:

- **Centros de coste**:
  - Tabla `user_cost_centers` que vincula usuarios con centros de coste.
  - Cada registro está asociado a:
    - un `cost_center` (modelo / tabla ya definida en el módulo de costes),
    - una `company` (modelo `Company` / tabla `companies`) que debe coincidir con la empresa en sesión (`$currentCompanyId`).

- **Tipo de negocio**:
  - Campo `business_type` añadido en `crm_contacts`.
  - Concern `App\Concerns\HasBusinessTypes` con el mapeo `índice -> etiqueta` y helpers tipo `comboOptions()`.

---

## Motivation / Problem

El equipo de administración necesita poder segmentar los contactos CRM no solo por datos básicos
(nombre, email, tipo de contacto, categorías), sino también por:

- **Centro de coste**: imprescindible para análisis y gestión económico-organizativa, permitiendo filtrar
  contactos relacionados con determinados centros de coste.
- **Tipo de negocio**: clasificar a los contactos según la naturaleza de la relación comercial
  (por ejemplo, venta directa, intermediación, patrocinio, etc.).

Sin estos filtros, la vista de contactos se queda corta para las consultas reales de trabajo
(combinaciones del tipo “contactos tipo X, del centro de coste Y, con tipo de negocio Z”).

---

## Alcance (Scope)

Incluido en este cambio:

1. **Backend / Dominio**
   - Añadir soporte de filtrado por:
     - `cost_center_id` (a través de la relación usuario ↔ centro de coste).
     - `business_type` (a través de `crm_contacts.business_type`).
   - Integrar estos filtros tanto en:
     - el **filtro estándar** (cabecera / query params directos),
     - como en el **filtro avanzado** (“adhoc”), reutilizando:
       - `adHocFilterDefinitions()`,
       - `adHocFilterUiConfig()`,
       - `activeFiltersLegend()`.
   - Aplicar el filtrado siempre contextualizado a la **empresa en sesión** (`currentCompany` /
     `CompanyContext`), igual que el resto de filtros CRM.
   - Funcionar tanto en:
     - `/admin/crm-contacts` (contactos),
     - `/admin/crm-leads` (leads: subset de contactos con `contact_type = 'clp'`).

2. **Frontend**
   - Ampliar el filtro avanzado / filtros de tabla en `Admin/CrmContact/Index.jsx` para incluir:
     - `Centro de coste` (select).
     - `Tipo de negocio` (select).
   - Sincronizar estos nuevos campos con `useTableManagement` para que viajen como query params a:
     - ruta índice (`slug + '.index'`),
     - endpoint `slug + '.filtered-data'`.

3. **OpenSpec**
   - Documentar el cambio en:
     - `openspec/changes/2026-02-04_crm-contacts-filtros-avanzados/proposal.md`
       (este archivo).
     - `openspec/changes/2026-02-04_crm-contacts-filtros-avanzados/tasks.md`
       (lista de tareas concretas: backend, frontend, tests, UX, etc.).

Fuera de alcance (por ahora):

- Modificar lógica de autorización o permisos CRM.
- Crear nuevos centros de coste o tipos de negocio desde esta pantalla.
- Cambiar el modelo de datos de `user_cost_centers` o `crm_contacts` más allá del uso para filtrado.
- Mejorar rendimiento global de CRM más allá de lo estrictamente relacionado con estos filtros.

---

## Requisitos funcionales

### Filtro: Centro de coste

1. El filtro “Centro de coste” debe permitir seleccionar un (1) centro de coste desde un select.
   - Fuente de opciones: centros de coste activos accesibles para la empresa en sesión.
   - El valor de cada opción será el `id` del centro de coste.
2. Al aplicar un centro de coste:
   - Solo deben mostrarse los contactos (usuarios) que:
     - estén vinculados a al menos un registro en `user_cost_centers`
     - donde `user_cost_centers.company_id = currentCompanyId`
     - y `user_cost_centers.cost_center_id = valor_seleccionado`.
3. El filtro debe funcionar tanto en:
   - Listado de contactos (`/admin/crm-contacts`),
   - Listado de leads (`/admin/crm-leads`),
     respetando la lógica actual de leads (subconjunto por `contact_type = 'clp'`).

### Filtro: Tipo de negocio

1. El filtro “Tipo de negocio” debe mostrarse como un select basado en
   `App\Concerns\HasBusinessTypes` (helper `comboOptions()` si existe o equivalente).
   - Cada opción tendrá:
     - `value`: entero `business_type`,
     - `label`: texto legible para usuario.
2. Al aplicar un tipo de negocio:
   - Se deben mostrar los contactos que tengan al menos un `crm_contacts` enlazado al usuario
     con:
     - `crm_contacts.company_id = currentCompany`
     - `crm_contacts.business_type = valor_seleccionado`.
3. Si un usuario tiene varios contactos CRM con distintos `business_type`:
   - El filtro se considera cumplido si **alguno** de sus contactos CRM cumple el criterio
     (lógica “OR” interna por usuario).

### Combinación con otros filtros

- Ambos filtros deben:
  - combinarse con el resto de filtros existentes (nombre, email, `contact_type`, categorías, fechas…),
  - respetar el comportamiento actual de paginación, ordenación y exportación (cuando se reactive).

---

## Requisitos técnicos

### Backend

1. **UserFilterRequest**
   - Ampliar para aceptar los nuevos campos de filtro tanto en cabecera como en adhoc (si aplica):
     - `cost_center_id` (nullable, entero).
     - `business_type` (nullable, entero).
   - En caso de ir dentro del bloque `adhoc`, las reglas se deberán declarar como:
     - `adhoc.cost_center_id` → `nullable|integer`
     - `adhoc.business_type` → `nullable|integer`

2. **CrmContactController::dataQuery(Request $request)**
   - Reutilizar la lógica actual de construcción de la query base:
     - joins con `crm_contacts` y `user_companies`,
     - filtros por empresa actual, leads/contactos, etc.
   - Añadir dentro del array `$filters` (filtros “de cabecera” ya existentes) dos nuevas entradas:

     ```php
     'cost_center_id' => function ($q, $v) use ($company_id) {
         $q->whereHas('costCenters', function ($sub) use ($v, $company_id) {
             $sub->where('user_cost_centers.company_id', $company_id)
                 ->where('user_cost_centers.cost_center_id', $v);
         });
     },

     'business_type' => function ($q, $v) use ($company_id) {
         $q->whereExists(function ($sub) use ($v, $company_id) {
             $sub->from('crm_contacts as cc2')
                 ->whereColumn('cc2.user_id', 'users.id')
                 ->where('cc2.company_id', $company_id)
                 ->where('cc2.business_type', $v);
         });
     },
     ```

   - Para `costCenters` se asume un método de relación en `User` tipo:

     ```php
     public function costCenters()
     {
         return $this->belongsToMany(CostCenter::class, 'user_cost_centers')
             ->withPivot('company_id'); // u otros pivots si son relevantes
     }
     ```

     Si no existe, se definirá como parte de este change.

3. **CrmContactController::adHocFilterDefinitions(string|int $company_id)**

   - Añadir los nuevos filtros dentro del array que devuelve el método, siguiendo el patrón existente:

     ```php
     'business_type' => [
         'rules' => ['nullable', 'integer'],
         'apply' => function (Builder $q, $v) use ($company_id) {
             if (! $v) return;

             $q->whereExists(function ($sub) use ($v, $company_id) {
                 $sub->from('crm_contacts as cc2')
                     ->whereColumn('cc2.user_id', 'users.id')
                     ->where('cc2.company_id', $company_id)
                     ->where('cc2.business_type', $v);
             });
         },
     ],

     'cost_center_id' => [
         'rules' => ['nullable', 'integer'],
         'apply' => function (Builder $q, $v) use ($company_id) {
             if (! $v) return;

             $q->whereHas('costCenters', function ($sub) use ($v, $company_id) {
                 $sub->where('user_cost_centers.company_id', $company_id)
                     ->where('user_cost_centers.cost_center_id', $v);
             });
         },
     ],
     ```

   - Estos filtros se recibirán dentro del bloque `adhoc[...]` del request, igual que los actuales
     (`sex`, `nif`, `created_between`, etc.).

4. **CrmContactController::adHocFilterUiConfig()**

   - Extender la configuración devuelta por este método para incluir los campos:

     ```php
     [
         'key'   => 'business_type',
         'label' => __('tipo_negocio'),
         'type'  => 'select',
         'multiple' => false,
         'options'  => HasBusinessTypes::comboOptions(), // o equivalente
     ],
     [
         'key'   => 'cost_center_id',
         'label' => __('centro_coste'),
         'type'  => 'select',
         'multiple' => false,
         'options'  => $this->costCenterOptionsForCompany($company_id), // helper interno
         'colClass' => 'col-12',
     ],
     ```

   - La función `costCenterOptionsForCompany()` no es obligatoria pero se recomienda encapsular
     ahí la lógica de obtención de centros de coste activos para la empresa.

5. **CrmContactController::activeFiltersLegend(Request $request)**

   - Extender la leyenda para mostrar de forma legible los filtros aplicados desde el bloque `adhoc`:

     - Para `business_type`:
       - Obtener el índice (`adhoc['business_type']`),
       - Resolver la etiqueta mediante `HasBusinessTypes::typesOf($value)` o un mapa equivalente,
       - Añadir entrada al array `$legend` con `scope = 'adhoc'`, `path = 'business_type'`.

     - Para `cost_center_id`:
       - Resolver el nombre del centro de coste por `id` (con `Cache::remember` siguiendo el patrón de país/provincia/población),
       - Añadir entrada al array `$legend` con `scope = 'adhoc'`, `path = 'cost_center_id'`.

6. **CrmContactController::index(Request $request)**

   - Asegurarse de que:
     - se pasan los nuevos parámetros de filtro a `dataQuery` vía `$request`,
     - se incluyen, si procede, colecciones auxiliares para poblar los selects en frontend:
       - `cost_centers` (ids + nombre),
       - `business_types` (opcional si no se construyen 100 % desde el concern).

7. **UserResource**

   - No es obligatorio exponer la información de filtro salvo que interese mostrar:
     - centro(s) de coste en lista,
     - etiqueta de tipo de negocio.
   - En caso de exponer `business_type` como label, reutilizar `HasBusinessTypes::typesOf()`.

### Frontend

1. **Index.jsx (Admin/CrmContact/Index.jsx)**

   - Añadir props para:
     - `cost_centers` (si se expone desde backend),
     - `business_types` (si no se calculan en cliente a partir de un mapa simple).

   - Construir arrays de opciones:

     ```js
     const costCenterOptions = Array.isArray(cost_centers)
       ? cost_centers.map(cc => ({ value: cc.id, label: cc.name }))
       : [];

     const businessTypeOptions = Array.isArray(business_types)
       ? business_types.map(opt => ({ value: opt.value, label: opt.label }))
       : [];
     ```

   - Los nuevos filtros avanzados se renderizan a partir de la configuración devuelta por
     `adHocFilterUiConfig()`. El formulario de filtros avanzados debe:
     - mostrar un `select` para `business_type` usando `businessTypeOptions`,
     - mostrar un `select` para `cost_center_id` usando `costCenterOptions`,
     - enviar los valores bajo `adhoc[business_type]` y `adhoc[cost_center_id]`.

   - Integración con `useTableManagement`:
     - Asegurarse de que los cambios en el formulario de filtros avanzados disparan
       la recarga vía endpoint `slug + '.filtered-data'` manteniendo el resto de filtros y paginación.

2. **Componentes de filtro avanzado**

   - Donde esté definido el formulario de filtros avanzados (componente específico),
     añadir los nuevos campos siguiendo el mismo contrato que el resto de entradas `adhoc`:

     - `business_type`:
       - tipo `select`,
       - opciones basadas en `HasBusinessTypes`,
       - mapeo transparente a `adhoc.business_type`.

     - `cost_center_id`:
       - tipo `select`,
       - opciones basadas en los centros de coste de la empresa actual,
       - mapeo a `adhoc.cost_center_id`.

   - El `placeholder` y las etiquetas deben seguir la convención de traducciones
     existentes (`__('centro_coste')`, `__('tipo_negocio')`, etc.).

---

## Consideraciones de UX

- Los nuevos filtros deben:
  - Seguir la disposición visual y estilos del filtro avanzado actual.
  - Mantener el valor seleccionado al paginar / ordenar.
  - Resetearse correctamente cuando se pulse “Limpiar filtros” (si existe esa acción global).

- Orden recomendado de filtros avanzados:
  1. Sexo  
  2. NIF  
  3. Alta  
  4. Aniversario  
  5. Dirección  
  6. **Tipo de negocio**  
  7. **Centro de coste**  
  8. País, provincia, población, código postal  

---

## Riesgos y compatibilidad

- **Riesgos de rendimiento**:
  - Añadir `whereHas` y `whereExists` sobre nuevas tablas/columnas introduce más joins
    lógicos. Es recomendable:
    - Confirmar índices en:
      - `user_cost_centers.user_id`
      - `user_cost_centers.company_id`
      - `user_cost_centers.cost_center_id`
      - `crm_contacts.user_id`
      - `crm_contacts.company_id`
      - `crm_contacts.business_type`
    - Validar el plan de ejecución en un entorno con datos reales.

- **Compatibilidad**:
  - Los filtros son optativos: si no se usan, la query se comporta exactamente igual que antes.
  - No se modifican rutas ni nombres de parámetros existentes, solo se añaden nuevos.

---

## Plan de despliegue

1. **Migraciones / índices**
   - Verificar que:
     - `crm_contacts.business_type` está creado y poblado donde aplique.
     - `user_cost_centers` existe y tiene índices adecuados.
   - Añadir índices faltantes en una migration, si procede.

2. **Backend**
   - Ampliar `UserFilterRequest` y `CrmContactController` (`index`, `filteredData`, `dataQuery`).
   - Ampliar `adHocFilterDefinitions()`, `adHocFilterUiConfig()` y `activeFiltersLegend()`
     para incluir los nuevos filtros.
   - Ajustar / crear relación `costCenters()` en `User`.

3. **Frontend**
   - Actualizar `Index.jsx` (CrmContact) para consumir las nuevas props y los nuevos filtros adhoc.
   - Actualizar el componente de filtros avanzados.
   - Verificar que `useTableManagement` no entra en bucles de navegación con los nuevos parámetros.

4. **Pruebas**
   - Casos con y sin filtros.
   - Combinación con leads (`/crm-leads`).
   - Combinación con otros filtros existentes (ej. `contact_type` + `business_type` + `cost_center_id`).
   - Verificación de la leyenda de filtros activos (`activeFiltersLegend`) para:
     - `business_type`,
     - `cost_center_id`.
   - Prueba de no regresión sobre rendimiento (al menos a nivel de percepción y tiempos de respuesta visibles).

---
