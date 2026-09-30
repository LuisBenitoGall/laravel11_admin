## 1. Columna e i18n

- [x] 1.1 En `MarketingList/Index.jsx`, añadir al final de `columns` el item `created_at` con `label: __('fecha_creacion')`, `sort: true`, `filter: 'date'`, `dateKeys: ['date_from', 'date_to']`, `placeholder: __('fecha_creacion')`, `class_th`/`class_td` alineados como Fecha alta de `/admin/users`, y `render` que pinta el string del Resource (vacío si null)
- [x] 1.2 No tocar columnas `name` / `members_count` / `created_by` ni el bloque Acciones; Acciones sigue fuera del array
- [x] 1.3 Añadir `fecha_creacion` en `lang/en.json`; no cambiar la clave de `es.json`

## 2. Tests

- [x] 2.1 Feature: índice Inertia con locale `es` (o `ca`) incluye `created_at` por lista en formato `d/m/Y`, no ISO
- [x] 2.2 Feature: mismo índice con locale `en` incluye `created_at` en formato `Y/m/d`
- [x] 2.3 Feature: `date_from`/`date_to` filtran el índice por `marketing_lists.created_at` (rango inclusive); no cambiar `MarketingListResource` ni `renderCellContent` global ni `dataQuery` (ya cableado)

## 3. Verificación

- [x] 3.1 Ejecutar los tests de este change y comprobar que pasan
- [x] 3.2 `/opsx-verify` o checklist vs spec/design/tasks sin bloqueos
