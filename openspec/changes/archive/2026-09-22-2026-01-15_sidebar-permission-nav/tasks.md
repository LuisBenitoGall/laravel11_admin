# Tasks: sidebar-permission-nav

## Agent instructions (cuando aplique)

- Tras completar una tarea, marca su checkbox como completado (`[x]`) en este archivo.
- No marques tareas si no se cumple el criterio “Done”.
- Si durante la ejecución se detecta que una tarea necesita cambios de alcance o decisiones nuevas:
  - no la marques
  - añade una nota bajo la tarea con el bloqueo y la decisión pendiente.
- Si se completa parcialmente, deja el checkbox sin marcar y añade nota con lo pendiente.

## 0) Decisiones y contrato (cerrar antes de tocar más)

- [ ] Decisión: permisos para links estáticos (módulos obligatorios/admin) se validan por **nombre de ruta** (route name de Ziggy).
  - Ejemplos: `users.index`, `users.contacts`, `companies.sectors`, `cost-centers.index`.
  - Done: el helper `can()` en Sidebar recibe `routeName` y se usa en todos los links estáticos.

- [ ] Decisión: módulos administrativos (Configuración) se muestran **solo** si `auth.is_super_admin === true`.
  - Done: Configuración desaparece completamente para no-SuperAdmin.

- [ ] Decisión: módulos optativos dinámicos son **fuente única** `/secondary-menu` y el frontend no aplica reglas extra (no “defaults”, no filtros por id, no heurísticas).
  - Done: el render dinámico usa `modules` tal cual viene del backend (con saneado array/no array).

## 1) Backend: ampliar `props.auth` (Inertia share)

Archivo: `app/Http/Middleware/HandleInertiaRequests.php`

- [x] Añadir a `auth`:
  - `permissions: string[]`
  - `is_super_admin: boolean`
  - Done:
    - `usePage().props.auth.permissions` existe y es array (aunque esté vacío).
    - `usePage().props.auth.is_super_admin` existe y es boolean.

- [x] Confirmar coherencia con Spatie:
  - `permissions` debe contener permisos efectivos (roles + directos).
  - Done: un usuario con rol que otorga permisos ve esos permisos en `auth.permissions`.

- [ ] (Opcional) Rendimiento:
  - Si `getAllPermissions()` penaliza, introducir cache por usuario o alternativa.
  - Done: si se aplica optimización, documentarla en `proposal.md`.

## 2) Frontend: Sidebar.jsx (obligatorios + admin) con arrays + render iterativo

Archivo: `/resources/js/Pages/Admin/Partials/Sidebar.jsx`

### 2.1 Lectura de auth y helper `can()`

- [x] Leer `auth` desde `usePage().props.auth` y normalizar:
  - `const permissions = Array.isArray(auth.permissions) ? auth.permissions : []`
  - `const isSuperAdmin = !!auth.is_super_admin`
  - `const can = (routeName) => permissions.includes(routeName) || isSuperAdmin`
  - Done: Sidebar no rompe si `auth` o `permissions` no existen (fallback seguro).

### 2.2 Refactor de render: dejar de hardcodear links

- [x] Introducir helper local `renderSubMenu(items)` que renderice `<NavLink/>` iterando items visibles.
  - Cada item: `{ route, activeSlug, label }`
  - Done: “Mi cuenta”, “Usuarios” y “Empresas” renderizan sus links desde arrays (sin duplicar HTML).

### 2.3 Módulos obligatorios: arrays + filtrado + ocultación de módulo

- [x] “Mi cuenta”:
  - Definir `myAccountItems[]` con rutas reales (`company-accounts.index`, `company-modules.index`).
  - `visibleMyAccountItems = myAccountItems.filter(i => can(i.route))`
  - Renderizar módulo solo si `visibleMyAccountItems.length > 0`
  - Done: si usuario no tiene permisos, “Mi cuenta” no aparece.

- [x] “Usuarios”:
  - Definir `usersItems[]` con rutas reales (`users.index`, `users.contacts`, `users.categories`).
  - Filtrar + ocultar módulo si vacío.
  - Done: se ven solo los links permitidos.

- [x] “Empresas”:
  - Definir `companiesItems[]` con rutas reales (según Sidebar actual):
    - `companies.index`
    - `companies.sectors`
    - `cost-centers.index`
    - `workplaces.index`
    - `company-settings.index`
    - `customers.index`
    - `providers.index`
    - `company-sectors.index`
  - Filtrar + ocultar módulo si vacío.
  - Done: módulo “Empresas” solo aparece si hay al menos un link permitido.

### 2.4 Módulos administrativos (Configuración)

- [x] Marcar “Configuración” como administrativo:
  - Renderizar módulo solo si `isSuperAdmin === true`.
  - (Opcional) también filtrar links internos por `can(routeName)` si quieres granularidad incluso para Super Admin.
  - Done: no-SuperAdmin no ve Configuración; acceso por URL sigue protegido por backend.

### 2.5 Estado activo y UX

- [x] Verificar `currentModule` y `currentSlug`:
  - Expand/collapse correcto en cada módulo.
  - Clase `active` correcta en cada link renderizado desde arrays.
  - Done: comportamiento visual igual o mejor que antes.

## 3) Frontend: menú dinámico (optativos) sin reglas extra

Archivo: `/resources/js/Pages/Admin/Partials/Sidebar.jsx`

- [x] Eliminar reglas extra en dinámicos:
  - Quitar `default_modules` y cualquier filtro que “resucite” módulos vacíos.
  - Done: lo dinámico depende solo del backend.

- [x] Resiliencia ante error:
  - En catch: `setModules([])`
  - Done: Sidebar no rompe si `/secondary-menu` falla.

- [x] Reconsulta al cambiar empresa:
  - Dependencias del `useEffect`: `currentCompany?.id` y una señal estable de módulos (`JSON.stringify(companyModules)` si es lo que ya tienes).
  - Done: al cambiar empresa, cambia el menú dinámico acorde.

## 4) Backend: `/secondary-menu` (validación de contrato, sin reescritura salvo necesidad)

Archivo: `App\Http\Controllers\Admin\SecondaryMenuController`

- [ ] Verificar contrato:
  - Sin empresa en sesión => `[]`
  - Filtra por módulos activos de empresa
  - Para no-SuperAdmin:
    - exige `module_<slug>`
    - filtra funcionalidades por `<funcSlug>.index`
    - elimina módulos vacíos
  - Done: cumple proposal + spec.

- [ ] Regla Super Admin en dinámicos:
  - Confirmar la regla vigente: Super Admin ve módulo completo (sin filtrar funcionalidades).
  - Done: coherencia con frontend (`can()` hace bypass si `isSuperAdmin`).

## 5) Seguridad: middleware/policies (validación)

- [ ] Rutas de módulos obligatorios:
  - Confirmar que cada ruta tiene protección real (permiso/empresa en sesión).
  - Done: acceso directo sin permiso devuelve 403.

- [ ] Rutas administrativas:
  - Confirmar middleware/policy Super Admin.
  - Done: no-SuperAdmin no accede por URL.

## 5.1) UX Sidebar: scroll interno

- [x] Añadir scroll vertical interno al área de menús del sidebar para evitar que los menús se acumulen fuera del viewport.
  - Done:
    - El logo/cabecera permanece fija.
    - El scroll ocurre solo en el área de navegación.
    - El scroll es suave (smooth).
    - No se produce scroll del body al llegar arriba/abajo (overscroll contained).

## 5.2) UX Sidebar: close / open sidebar

- [x] Añadir funcionalidad de apertura/cierre del Sidebar con soporte UX para desktop/tablet y mobile según OpenSpec.
  - Done:
    - El botón `#topnav-hamburguer-icon` alterna el estado del Sidebar.
    - La transición de apertura/cierre es suave (CSS transition) y no hay saltos bruscos.

    - Desktop/Tablet (>= md):
      - Existe estado **abierto** y estado **colapsado**.
      - En **colapsado**:
        - Se muestran los logos en versión reducida (logo-sm) de forma proporcionada.
        - Los items de menú principal muestran **solo iconos**, sin etiquetas.
        - Los submenús se abren como **flyout** a la derecha del sidebar (position absolute), legibles y clicables, manteniendo estilo del menú.
      - El estado abierto/colapsado se persiste en `localStorage` (`admin_sidebar_collapsed`: "0"/"1") y se restaura al cargar.

    - Mobile (< md):
      - El Sidebar funciona como **off-canvas**:
        - Por defecto está oculto fuera del viewport (lado izquierdo).
        - Al pulsar el botón, aparece deslizando desde la izquierda.
        - Se muestra un **overlay** sobre el contenido y permite cerrar al hacer click en él.
        - Al cerrar, el sidebar vuelve a ocultarse fuera del viewport.
      - En mobile NO se persiste el estado: al recargar, el sidebar inicia cerrado.

    - No regresión:
      - No se modifica la lógica existente de permisos, módulos dinámicos, axios ni collapses Bootstrap en modo abierto.
      - El scroll interno del sidebar sigue funcionando (no scroll del body al navegar por menús largos).

## 6) Pruebas manuales (Acceptance Criteria)

- [ ] Empresa sin módulo activo: marketing no aparece aunque usuario tenga `module_marketing`.
- [ ] Usuario sin permiso de módulo: contabilidad no aparece aunque empresa lo tenga.
- [ ] Link sin permiso: el link no aparece (estáticos por routeName; dinámicos por `<func>.index`).
- [ ] Módulo optativo vacío: backend lo elimina, frontend no lo muestra.
- [ ] Módulo obligatorio vacío: “Usuarios/Empresas/Mi cuenta” desaparecen si no hay links visibles.
- [ ] Super Admin: ve Configuración; no-SuperAdmin no.
- [ ] Cambio empresa: dinámicos cambian tras reconsulta `/secondary-menu`.
- [ ] URL directa sin permiso: 403.

## 7) Cierre del change

- [ ] Actualizar `proposal.md` si hubo ajustes:
  - “roles” -> `is_super_admin`
  - permisos estáticos por routeName
  - eliminación de `default_modules`
- [ ] Si el spec requiere precisión (estáticos por routeName vs `.index`), crear delta en `openspec/changes/sidebar-permission-nav/specs/...`.
- [ ] Archivar change cuando esté validado:
  - mover carpeta a `openspec/changes/archive/sidebar-permission-nav/` (según convención del repo).
