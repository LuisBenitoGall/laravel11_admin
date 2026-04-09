# Spec: Data Tables Pattern (Inertia + React + Bootstrap)

## Context

- Definimos el proceso para la generación de vistas Data Tables con la información propia de cada dominio.
- Los Data Tables se componen de diferentes componentes y vistas parciales. Algunos de estos componentes son obligatorios en todas las tablas y otros son opcionales.
- Los Data Tables se presentan en dos situaciones distintas: vista propia y única (por lo general bajo una url tipo `admin/[module_slug]`) o en un tab de una vista más general de alguna entidad. Pueden diferir en la fuente de datos, pero no en la estructura de sus componentes.


## Goals / Non-goals

### Goals:
- Patrón único para tablas de listados con componentes parametrizables.
- Estandarizar contrato backend → frontend para reducir código repetido y errores por variaciones de “shape”.
- Permitir instanciar nuevas tablas mediante configuración (columnas/filtros/acciones), sin reescribir estructura base.
- Listado de registros scoped por empresa (multiempresa).

### Non-goals:
- No es un directorio global de registros sin considerar empresa o permisos.
- No define la lógica específica de cada dominio (joins, cálculos complejos, columnas especiales).
- No obliga a que todas las tablas tengan exactamente los mismos componentes opcionales (builder mode, show panel, etc.).


## Definiciones

- **Data Table View**: vista React que renderiza una tabla “Index” parametrizable sobre un conjunto paginado de datos.
- **Table Container (table)**: objeto único enviado por backend que agrupa todo lo relativo a la tabla (datos, meta, query, permisos, preferencias, filtros UI).
- **Rows (table.rows)**: colección paginada (Inertia Resource Collection) con data y meta.
- **Query Params (table.queryParams)**: estado de filtros/sort/paginación, normalmente persistido en querystring.
- **Header Filters**: filtros por columna (fila FilterRow).
- **AdHoc Filters**: filtros avanzados parametrizables (modal/dropdown) definidos por backend.
- **Active Filters Legend**: “badges” que representan filtros aplicados y permiten eliminarlos individualmente.
- **Column Preferences**: preferencias de columnas visibles por usuario y tabla (persistencia).
- **Table Definition**: definición de columnas y comportamiento del frontend (array de columns), con keys consistentes con el payload.


## Requisitos funcionales comunes

Obligatorios
- Selector para mostrar y ocultar columnas (persistente por usuario y tabla).
- Selector de número de registros por página.
- CTA de exportación a CSV.
- CTA de exportación a PDF (si existe el exporter correspondiente).
- Cabecera con relación de columnas:
  - Por defecto siempre se incluye una columna inicial opcional (ej: “show panel”).
  - Por defecto siempre se incluye una columna final a la derecha para Acciones por registro.
- Fila con filtros (Header Filters):
  - Son opcionales por columna.
  - La columna de acciones nunca lleva filtro.
- Body de registros (render por columna y por fila).
- Footer:
  - Indicador de registros visualizados y total.
  - Paginador.
- Persistencia de filtros aplicados (querystring).
- i18n de labels.
- Control de permisos por acción y visibilidad de botones (UI basada en permisos; enforcement real en backend).

Opcionales
- Filtros avanzados (AdHoc Filters):
  - Modal o dropdown con campos parametrizables.
  - Leyenda con badges de filtros aplicados (con eliminación individual y recarga automática).
- Panel lateral / modal “ShowRegister” para visualizar registro sin abandonar la tabla.
- Modo “builder” (selección de registros, select all paginado + fetch total filtrado, submit de selección).
- Bulk actions (si el dominio lo requiere).
- Columnas especiales: imágenes, iconos, estado, links, chips, acciones custom.


## Reglas de negocio transversales

- **Multiempresa**: todo listado filtra por company_id desde CompanyContext.
- **Módulos**: si el módulo no está activo, debe impedirse el acceso (preferiblemente middleware). El frontend no debe ser el guardián.
- **Permisos**:
  -Naming estable por módulo: module_[x] y permisos específicos estilo domain.[create|destroy|edit|show|index|search|update].
  - Evaluación real siempre en backend (Policies/Gates/Spatie).
  - El frontend sólo oculta/inhabilita UI según permisos disponibles.


## Contrato de backend (Inertia response shape)

Reglas del contrato:
- El backend debe enviar un único objeto table con todo lo relacionado con la tabla.
- La colección de datos debe llamarse siempre rows, independientemente del dominio (no users, companies, contacts…).
- La respuesta debe incluir los datos del dominio fuera de table únicamente si son específicos (combos, builderMode, modales, etc.).

Shape estándar mínimo:
return Inertia::render('...', [
    'title'    => ...,
    'subtitle' => ...,
    'slug'     => ...,

    'table' => [
        'id' => 'tblX',

        // colección resource paginada
        'rows' => SomeResource::collection($paginator),

        // opcional (si se necesita explícito)
        'meta' => $paginator->toArray()['meta'] ?? null,

        // estado de query (filtros/sort/paginación) para la UI
        'queryParams' => request()->query() ?: [],

        // permisos consumibles por UI (ya calculados)
        'permissions' => $this->permissions,

        // preferencias de columnas por usuario
        'columnPreferences' => UserColumnPreference::forUserAndTables(
            Auth::id(),
            ['tblX']
        ),

        // filtros avanzados + leyenda
        'adhocFilters'        => $this->adHocFilterUiConfig(),
        'activeFiltersLegend' => $this->activeFiltersLegend($request),
    ],

    // datos específicos del dominio, fuera de table:
    'builderMode' => $builderMode ?? false,
    'builderList' => $builderList ?? null,
]);

Notas
- table.rows es una Resource Collection y debe contener:
  - data: filas
  - meta: links, total, current_page, per_page, etc.
- table.meta es opcional. Si el frontend siempre usa table.rows.meta, puede omitirse.


## Contrato de request (querystring)

Parámetros estándar:
- page (int)
- per_page (int)
- sort_field (string)
- sort_direction (ASC|DESC)
- Filtros de cabecera por clave de columna (ej: email, full_name, companies…)
- adhoc[...] para filtros avanzados (arrays, rangos, selects, etc.)

Reglas:
- El backend debe validar/normalizar:
  - per_page (permitidos)
  - sort_field (allowed list)
  - sort_direction (ASC|DESC)
- El frontend debe preservar estado con preserveState: true al paginar/filtrar.


## Frontend: estructura base de la vista Index

Componentes habituales (baseline):
- Layout: AdminAuthenticatedLayout
- Control de carga: useInertiaLoading
- Hook de gestión de tabla: useTableManagement
- Controles:
  - ColumnFilter
  - AdHocFiltersDropdown
  - RecordsPerPage
  - TableExporter
- Leyenda:
  - ActiveFiltersLegend
  - SpinnerInline (si hay filtros activos y loading)
- Tabla:
  - SortControl en columnas sortable
  - FilterRow para filtros por columna
  - renderCellContent para celdas
- Footer:
  - ShowRegister
  - Pagination

Contrato frontend esperado.
La vista Index debe recibir table y derivar de ahí:
- table.id
- table.rows
- table.queryParams
- table.permissions
- table.columnPreferences
- table.adhocFilters
- table.activeFiltersLegend


## Column definition (frontend)

Cada tabla define su array columns con la siguiente forma base:
{
  key: 'email',
  label: __('email'),
  sort: true|false,
  filter: 'text'|'select'|'date'|'' ,
  placeholder: __('email_filtrar'),
  options: [ {value,label} ] // si filter = select
  class_th: '',
  class_td: '',
  type: 'image'|'text'|... // opcional
  dateKeys: ['date_from','date_to'] // opcional si date/range
}

Reglas:
- key debe existir en la fila (row[key]) o estar soportado por renderCellContent si es derivado.
- La columna de acciones no forma parte de columns (es fija al final).
- Columnas condicionales (ej: “leads”) son aceptadas, pero deben mantener key estable.


## Exportación (CSV/PDF)

- La exportación se realiza llamando a filteredDataRoute con los mismos filtros activos (cabecera + adhoc).
- El endpoint de exportación debe devolver siempre:
    { "rows": [ ... ] }


## Permisos y acciones

- El backend proporciona table.permissions (o table.can si migras a capabilities).
- El frontend:
  - construye actions[] (CTA superiores) según permisos.
  - renderiza botones por fila según permisos.
- Acciones destructivas deben pasar por confirmación (useSweetAlert o equivalente).
- Enforcement real en backend (Policy/Gate).


## Persistencia de columnas

- Las preferencias se resuelven mediante UserColumnPreference::forUserAndTables(Auth::id(), ['tblX']).
- El frontend debe inicializar visibleColumns desde estas preferencias.
- Las interacciones de ColumnFilter actualizan y persisten estado para ese table.id.


## Proceso unívoco para crear una nueva Data Table

Backend:
- Crear index() que:
  - aplique CompanyContext (company_id)
  - construya query con filtros/sort allowed
  - pagine con per_page
  - devuelva table con id, rows, queryParams, permissions, columnPreferences, adhocFilters, activeFiltersLegend
- Crear endpoint de exportación filteredData():
  - recibe mismos filtros
  - devuelve { rows: Resource::collection($rows) }

Frontend: 
- Crear Index.jsx usando el baseline:
  - obtiene table y deriva rows, queryParams, etc.
  - define columns[]
  - instancia useTableManagement con tableId y queryParams
  - renderiza controles, FilterRow, tbody, Pagination
  - Añadir extras (show panel, builder mode, modales) solo si aplica.


## Checklist de Definition of Done (DoD)

- table.rows se llama rows (no variable por dominio).
- Filtros de cabecera funcionan y persisten en querystring.
- Sort permitido y validado en backend.
- per_page funciona y respeta límites.
- Pagination funciona con preserveState.
- Exportación usa endpoint que devuelve {rows: [...]}.
- Multiempresa garantizada (company_id).
- Permisos aplicados (UI + backend).
- Columnas visibles persistentes por usuario.
- Estados: vacío, cargando (si procede), error (si procede).