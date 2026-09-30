# Guía de adopción: Data Tables (`table.*`)

Fuente de verdad del contrato: [`spec.md`](./spec.md) en este mismo directorio.

Este documento resume **cómo** adoptar el patrón en un change dedicado. No migra listados existentes; cada Index se migra en su propio change.

**Alcance:** no se exige rollout masivo (Users, Companies, Products, Orders, etc.) ni eliminar el soporte legacy global de una vez. Referencia ya adoptada: listado CrmContact (`table.*` / `{ rows }`).

## Shape backend — `index()`

```php
return Inertia::render('Admin/Foo/Index', [
    'title' => ...,
    'subtitle' => ...,
    'slug' => ...,

    'table' => [
        'id' => 'tblFoo',
        'rows' => FooResource::collection($paginator),
        // 'meta' => opcional
        'queryParams' => request()->query() ?: [],
        'permissions' => $this->permissions, // o el mapa de la pantalla
        'columnPreferences' => UserColumnPreference::forUserAndTables(Auth::id(), ['tblFoo']),
        'adhocFilters' => $this->adHocFilterUiConfig(...),       // si aplica
        'activeFiltersLegend' => $this->activeFiltersLegend(...), // si aplica
    ],

    // Fuera de table: combos, flags de dominio, builderMode, etc.
    'someCombo' => ...,
]);
```

### Qué va **dentro** de `table`
- `id`, `rows`, `queryParams`, `permissions`, `columnPreferences`
- `adhocFilters`, `activeFiltersLegend` (si la tabla los usa)
- `meta` opcional

### Qué va **fuera** de `table`
- Combos / mapas para selects de dominio
- Flags (`leads`, `builderMode`, `builderList`, …)
- Título/subtítulo/slug/módulo de la pantalla

## Shape backend — `filteredData()` (export / select-all)

Siempre:

```php
return response()->json([
    'rows' => FooResource::collection($query->get()),
]);
```

No devolver claves de dominio (`users`, `contacts`, `accounts`, …).

## Frontend — `Index.jsx`

1. Recibir `table` (default `{}`).
2. Derivar: `tableId`, `rows`, `queryParams`, `adhocFilters`, `legendItems` desde `table`.
3. Pasar a `useTableManagement`:
   - `table: tableId`
   - `queryParams` desde `table.queryParams`
   - `filteredDataRoute` del listado
   - **No** hace falta `filteredDataKey` si el endpoint ya responde `{ rows }`.
4. `TableExporter` con `fetchData={filteredData}` (el hook ya devuelve un array de filas).
5. `AdHocFiltersDropdown` / `ActiveFiltersLegend` con `filters` / `items` y `queryParams` locales (no leer filtros globales de `usePage()` salvo locale).

Referencia en código: `Admin/CrmContact/Index.jsx` + `CrmContactController@index` / `filteredData`.

## Hook `useTableManagement`

Orden de extracción en export/`filteredData`:

1. `payload.rows` (array o `{ data }`)
2. `filteredDataKey` (compat legacy)
3. `entityName` / kebab→snake (compat)
4. Autodetección legacy

Permisos y preferencias de columnas: primero `props.table.*`, fallback a props en raíz.

## Checklist DoD por tabla (change de migración)

- [ ] Paginación OK (`per_page`, links)
- [ ] Sort OK (allowed fields en backend)
- [ ] Header filters (FilterRow) OK
- [ ] AdHoc filters + legend OK (si aplica)
- [ ] Column preferences OK (persistencia por `table.id`)
- [ ] Export Excel/PDF OK vía `{ rows }` (sin `filteredDataKey` de dominio)
- [ ] Permisos UI + enforcement backend OK
- [ ] Scope multiempresa (`CompanyContext` / `company_id`) OK
- [ ] Combos/flags de dominio siguen fuera de `table`
