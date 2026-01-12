# Change: Sidebar permission-based navigation (empresa + permisos)

## Summary

Alinear la navegación del aside (Sidebar) con el spec "App Layout & Navigation", de forma que:

- Solo se muestren módulos/funcionalidades accesibles según:
  - empresa en sesión (módulos activos)
  - permisos del usuario (Spatie)
  - rol Super Admin (para módulos administrativos)
- El menú dinámico de módulos optativos se renderice exclusivamente con los datos filtrados por backend (`GET /secondary-menu`).
- Los módulos obligatorios se oculten si el usuario no tiene ninguna funcionalidad visible dentro.

## Motivation / Problem

Actualmente:

- Los módulos obligatorios se muestran siempre aunque el usuario no tenga acceso a ninguna de sus opciones.
- El menú dinámico depende de `/secondary-menu`, pero el filtrado por permisos/empresa puede no estar completamente garantizado de extremo a extremo si no queda cerrado como contrato.
- Los módulos administrativos no están formalmente protegidos desde UI + backend como exclusividad Super Admin (puede existir parcialmente, pero este change lo fija como comportamiento).

Esto provoca UX inconsistente (menú con opciones inútiles) y mayor probabilidad de accesos erróneos/403.

## Scope

### In scope
- Sidebar: ocultación de módulos y funcionalidades según reglas del spec.
- Endpoint `/secondary-menu`: asegurar filtrado por empresa en sesión + permisos del usuario.
- Reconsulta del endpoint al cambiar empresa en sesión.
- Comportamiento resiliente ante error del endpoint (fallback seguro).

### Out of scope
- Rediseño visual del layout.
- Refactor completo de permisos o renaming masivo.
- Cambios de arquitectura del sistema de sesión (solo se consume el estado actual).

## Impacted Files / Components

Frontend:
- `/resources/js/Pages/Admin/Partials/Sidebar.jsx`

Backend:
- `SecondaryMenuController@__invoke` (ruta `GET /secondary-menu`)
- Middleware/policies existentes (no se reescriben aquí, pero se valida que cumplen el spec)

## Target Behavior (from spec)

### A. Orden de secciones del aside
1) Logo proyecto
2) (Opcional) logo empresa
3) Módulos obligatorios (estáticos)
4) Módulos administrativos (solo Super Admin)
5) Módulos optativos (dinámicos, backend)

### B. Reglas de visibilidad (módulos obligatorios)
- Un módulo obligatorio DEBE mostrarse solo si el usuario tiene permisos sobre el módulo o sobre alguna de sus funcionalidades.
- Si no queda ninguna funcionalidad visible dentro, el módulo DEBE ocultarse.
- Cada funcionalidad (link) SOLO DEBE mostrarse si el usuario tiene permiso para ella.

### C. Reglas de visibilidad (módulos administrativos)
- Solo se muestran para rol Super Admin.
- Rutas administrativas NO deben ser accesibles para roles distintos (validado por middleware/policy).

### D. Menú dinámico (módulos optativos)
- Fuente única: `GET /secondary-menu`
- Backend devuelve módulos + funcionalidades ya filtrados por:
  - empresa en sesión (módulos activos)
  - permisos de módulo: `module_[slug-module]`
  - permisos de funcionalidad: `[functionality-slug].index`
- Frontend:
  - NO filtra por id
  - NO aplica reglas adicionales salvo “array/no array”
  - Si el endpoint falla, renderiza menú dinámico vacío (no rompe el aside)
  - Al cambiar empresa, reconsulta endpoint y re-renderiza

### E. Módulo optativo vacío
- Si un módulo optativo queda sin funcionalidades visibles tras filtrado, NO se muestra.

## Implementation Plan

### 1) Backend: endurecer contrato de `/secondary-menu`
En `SecondaryMenuController@__invoke`:

1. Si no existe empresa en sesión -> devolver `[]`.
2. Resolver conjunto de módulos activos para empresa en sesión.
3. Para cada módulo candidato:
   - exigir permiso `module_[slug-module]`
   - filtrar funcionalidades dejando solo aquellas donde el usuario tenga permiso `[functionality-slug].index`
4. Eliminar módulos que queden con `functionalities` vacío.
5. Devolver array final.

Notas:
- El backend es la fuente de verdad del filtrado de módulos optativos.
- El payload DEBE mantener los campos mínimos definidos en el spec (id, slug, label, icon, functionalities[...]).
- No se introducen nuevos campos salvo que sea imprescindible (si se introducen, actualizar el spec).

### 2) Frontend: Sidebar.jsx (módulos obligatorios + admin + dinámicos)

#### 2.1. Utilidad de permisos en frontend
Definir una función local (o helper existente) para comprobar permisos:
- `can(permissionName): boolean`

La fuente de permisos será usePage().props.auth, expuesta por Inertia, conteniendo:
- permissions: string[] (nombres de permisos efectivos del usuario)
- is_super_admin: boolean (flag para módulos administrativos y bypass UX)

Si el contrato actual no expone roles/permisos en props, este change incluye exponerlos (en el share de Inertia) como parte del backend general de auth.

#### 2.2. Módulos obligatorios: ocultar si quedan sin funcionalidades visibles
Para cada bloque (Mi Cuenta, Usuarios, Empresas, Configuración si se considera obligatoria/administrativa según tu clasificación):
- Antes de renderizar el módulo, calcular si tiene al menos un item visible:
  - ejemplo: `const visibleItems = [...]` filtrado por `can('route.name')`
- Si `visibleItems.length === 0`, no renderizar el módulo.

Cada link del submenú se mostrará solo si can('<route.name>'), donde <route.name> es el nombre real de la ruta Ziggy usada por el link (ej: users.contacts, companies.sectors).

Nota: en módulos optativos dinámicos, el backend mantiene el criterio [functionality-slug].index según el contrato de /secondary-menu.

#### 2.3. Módulos administrativos: solo Super Admin
- Definir `isSuperAdmin` usando roles de auth.
- Renderizar sección administrativa solo si `isSuperAdmin === true`.

#### 2.4. Módulos optativos (dinámicos)
- Mantener `axios.get('/secondary-menu')`.
- En success:
  - `setModules(Array.isArray(data) ? data : [])`
- En error:
  - `setModules([])` (y opcional placeholder)
- Dependencias del useEffect:
  - `currentCompany?.id`
  - `JSON.stringify(companyModules)` (o equivalente estable)

### 3) Validar middleware/policies (sin reescritura)
- Confirmar que rutas administrativas y de módulos/funcionalidades exigen:
  - empresa en sesión
  - permiso de módulo y/o funcionalidad según corresponda
- Si falta algún middleware crítico en rutas existentes, añadirlo (cambio pequeño, pero dentro del scope “alineación seguridad”).

## Acceptance Criteria (verificables)

1. Empresa sin módulo activo:
   - Empresa E1 no tiene marketing activo.
   - Usuario tiene `module_marketing`.
   - Sidebar NO muestra módulo Marketing.

2. Usuario sin permiso de módulo:
   - Empresa E2 tiene contabilidad activa.
   - Usuario no tiene `module_contabilidad`.
   - Sidebar NO muestra módulo Contabilidad.

3. Funcionalidad sin permiso:
   - Módulo Pedidos visible.
   - Usuario no tiene `purchase_orders.index`.
   - Sidebar NO muestra “Pedidos de compra”.

4. Módulo optativo vacío:
   - Backend filtra funcionalidades y el módulo queda sin items.
   - Sidebar NO muestra ese módulo.

5. Módulo obligatorio sin funcionalidades visibles:
   - Usuario no tiene ningún permiso para links dentro de “Usuarios”.
   - Sidebar NO muestra el módulo “Usuarios”.

6. Super Admin:
   - Usuario con rol Super Admin ve módulos administrativos.
   - Usuario sin rol Super Admin NO ve módulos administrativos.

7. Cambio de empresa:
   - Al cambiar de empresa en topbar, Sidebar reconsulta `/secondary-menu` y cambia módulos dinámicos acorde a la nueva empresa.

8. Acceso directo por URL:
   - Usuario sin permisos intenta acceder a URL protegida.
   - Backend responde con 403 (o comportamiento definido) aunque el menú no muestre el link.

## Test Plan

Manual (mínimo):
- Probar con usuario Super Admin y usuario estándar.
- Probar con dos empresas (E1 con módulos A,B,C y E2 con A,D).
- Validar:
  - render inicial
  - cambio de empresa (re-render sin refrescar página completa)
  - error del endpoint `/secondary-menu` (simular 500 o cortar red)
  - acceso directo por URL a ruta no permitida

Opcional automatizable:
- Tests feature en backend para `/secondary-menu` verificando filtrado por permisos/empresa.
- Snapshot/component test para Sidebar con fixtures de auth y payload.

## Risks / Notes

- Riesgo de inconsistencia si el nombre del permiso no coincide con el nombre de la ruta usada en frontend (p.ej. users.contacts route vs permiso diferente).
    - Mitigación: alinear permisos con nombres de rutas, o introducir mapeo explícito { routeName, permissionName } en los arrays del Sidebar.
- Si el frontend no dispone de `roles/permisos` en props, hay que exponerlos vía Inertia share.
- Este change afecta UX (módulos que antes se veían ahora se ocultan). Es intencional.

## Rollback Plan

- Revertir cambios en Sidebar.jsx para volver a mostrar módulos obligatorios.
- Revertir filtrado adicional en `/secondary-menu` si se detecta ruptura por naming inconsistente.
- Mantener middleware/policies (no se recomienda revertir seguridad).
