- 03/02/2026:

Objetivo: Añadir scroll vertical interno (suave) al menú lateral para que el sidebar no acumule menús fuera del viewport.

Fuentes OpenSpec:
- openspec/_global/admin-layout-conventions.md: añadir sección "Sidebar UX" e indicar uso de clases .sidebar--scrollable y .sidebar-scroll-area
- openspec/changes/sidebar-permission-nav/tasks.md: añadir tarea "5.1 UX Sidebar: scroll interno" con criterios Done

Implementación:
- Modificar resources/js/Pages/Admin/Partials/Sidebar.jsx:
  - añadir clase sidebar--scrollable al contenedor root del sidebar
  - añadir clase sidebar-scroll-area al div id="scrollbar"
  - mantener fija la cabecera/logo (navbar-brand-box)
- No modificar lógica existente de permisos, módulos dinámicos, axios ni collapses bootstrap.

CSS:
- En resources/sass/app.scss asegurar que:
  - .sidebar--scrollable = display:flex; flex-direction:column; height:100vh
  - .sidebar-scroll-area = flex:1; overflow-y:auto; overflow-x:hidden; scroll-behavior:smooth; overscroll-behavior:contain; -webkit-overflow-scrolling:touch

Entrega:
- Mostrar diff de Sidebar.jsx, app.scss, admin-layout-conventions.md y tasks.md.
- Marcar tarea como [x] solo si cumple el criterio Done.


-----------------------------------------------------------------------------------------------------------

Objetivo: incluir close/open del sidebar mediante el botón #topnav-hamburguer-icon, con comportamiento desktop/tablet (colapsado) y mobile (off-canvas) según OpenSpec.

Fuentes OpenSpec:
- openspec/_global/admin-layout-conventions.md: "Cierre / apertura de la barra lateral"
- openspec/changes/sidebar-permission-nav/tasks.md: tarea "5.2) UX Sidebar: close / open sidebar" con criterios Done

Implementación:
- Modificar resources/js/Pages/Admin/Partials/Sidebar.jsx para soportar estado abierto/colapsado y mobile off-canvas.
- Conectar el click del botón #topnav-hamburguer-icon con el Sidebar SIN reestructurar toda la app:
  - Preferente: comunicación por window CustomEvent (emit desde Topbar, listen en Sidebar) o usar el patrón existente del Layout si ya hay uno.
  - Evitar listeners duplicados y asegurar cleanup en useEffect.
- No modificar lógica existente de permisos, módulos dinámicos, axios ni collapses Bootstrap (modo abierto debe seguir funcionando igual).
- Persistencia:
  - Desktop/Tablet: persistir estado en localStorage (admin_sidebar_collapsed "0"/"1") y restaurar al cargar.
  - Mobile: no persistir; iniciar cerrado.

CSS:
- Aplicar estilos necesarios en resources/sass/app.scss respetando el anidamiento existente.
- Incluir:
  - transición suave para apertura/cierre (width/transform)
  - estilos para estado colapsado (ocultar labels, mantener iconos, logo-sm)
  - comportamiento mobile off-canvas + overlay (mostrar/ocultar con transición)

Entrega:
- Mostrar diff de Sidebar.jsx, app.scss, admin-layout-conventions.md y tasks.md.
- Marcar tarea como [x] solo si cumple el criterio Done.


-----------------------------------------------------------------------------------------------------------

Objetivo: corregir aspecto del sidebar cuando se muestra en modo cerrado.

Fuentes OpenSpec:
- openspec/_global/admin-layout-conventions.md: "Cierre / apertura de la barra lateral"
- openspec/changes/sidebar-permission-nav/tasks.md: tarea "5.2) UX Sidebar: close / open sidebar" con criterios Done

Implementación:
- aplicar con rigor las instrucciones descritas  openspec/changes/sidebar-permission-nav/tasks.md: tarea "5.2) UX Sidebar: close / open sidebar", en especial a lo referente a: 
	- al tamaño del logo pues ahora se ve minúsculo. Debes reducir los paddings laterales de .navbar-brand-box para la versión minimizada.
	- mostrar los submenús en modo **flyout**, ahora mismo no se muestran los submenús de ningún modo.