# Admin layout conventions (global)

Estas convenciones aplican por defecto a todos los módulos salvo que el spec/tasks indique explícitamente lo contrario.

## Controllers
- Por defecto, los Controllers deben crearse en el namespace:
  - `App\Http\Controllers\Admin`
- Por defecto, los controllers deben declarar estas propiedades:
  - `private string $module = '[slug-modulo]';`
  - `private string $option = '[slug-modulo-castellano]';`
  - `protected array $permissions = [];`

## Frontend Pages
- Por defecto, las páginas deben ubicarse en:
  - `resources/js/Pages/Admin/[Model]/`
- Todas las Pages deben declarar:
  - `const actions = [];`
  (Obligatorio aunque esté vacío)
  - En el array actions deben incluirse todos los CTA genéricos de la páginas (ej: regresar a la vista anterior, crear nuevo item del modelo, crear valores supeditados al modelo principal, ir a funcionalidades paralelas al modelo,...)
  - Su accesibilidad siempre estará supeditada a que el usuario disponga del permiso correspondiente.
  - Las acciones pueden ser un enlace directo o mostrar un modal (modal = true)
  - A continuación se muestra un ejemplo de una acción tipo:
        const actions = [];
        if (permissions?.['crm-contacts.create']) {
            actions.push({
                text: __('contacto_nuevo'),
                icon: 'la-plus',
                url: '',
                modal: true,
                onClick: handleOpenModalUserCreate
            });
        }


## Layout obligatorio (Pages)
- Todas las Pages deben usar esta estructura base de return salvo que se indique lo contrario:

return (
    <AdminAuthenticatedLayout
        user={auth.user}
        title={title}
        subtitle={subtitle}
        actions={actions}
    >
        <Head title={title} />

        {/* Contenido */}
        <div className="contents">
            ...
        </div>
    </AdminAuthenticatedLayout>
);

## Sidebar UX
### Scroll interno del menú lateral
- El menú lateral (Sidebar) debe disponer de **scroll vertical interno** cuando el contenido exceda el alto visible.
- El scroll debe ser **suave** (smooth) y no debe desplazar el `body`.
- La cabecera/logo del sidebar debe permanecer fija; el scroll solo afecta al área de navegación.

#### Requisitos CSS mínimos
- El contenedor del sidebar debe ocupar el alto del viewport (`height: 100vh` o equivalente).
- El área scrolleable debe usar:
  - `overflow-y: auto`
  - `scroll-behavior: smooth`
  - `overscroll-behavior: contain`
  - `-webkit-overflow-scrolling: touch`
- El Sidebar usará las clases .sidebar--scrollable (contenedor) y .sidebar-scroll-area (zona scrolleable)

### Cierre / apertura de la barra lateral (UX + responsive)
- El menú lateral (Sidebar) debe poder alternar entre estado **abierto** y **cerrado/colapsado** mediante el botón `#topnav-hamburguer-icon`.
- La transición de apertura/cierre debe ser **suave** (CSS transition), nunca brusca.

#### Estados en desktop/tablet (>= md)
- **Estado abierto (default):**
  - Se muestran logos y etiquetas de los items del menú.
  - Submenús funcionan como hasta ahora (collapse/expand normal).
- **Estado cerrado/colapsado:**
  - Deben seguir mostrándose los logos en versión reducida (logo-sm) de forma proporcionada.
  - Deben mostrarse **solo los iconos** de cada item de menú principal, **sin su etiqueta**.
  - Los submenús deben seguir siendo accesibles y legibles:
    - En estado colapsado, los submenús se muestran como **flyout lateral** a la derecha del sidebar al interactuar con el item principal (click preferente; hover opcional solo si no interfiere con mobile).
    - El flyout debe mantener el estilo visual del menú (tipografía, colores, estados activos) y sus opciones deben ser clicables.
  - El sidebar colapsado no debe provocar scroll horizontal en el contenido principal.

#### Comportamiento en mobile (< md)
- En mobile, el sidebar debe comportarse como **off-canvas**:
  - Por defecto debe estar **oculto** fuera del viewport (lado izquierdo).
  - Al accionar `#topnav-hamburguer-icon`, el sidebar se muestra deslizando desde la izquierda (animación suave).
  - Debe existir una forma clara de cerrarlo: volver a pulsar el botón y/o pulsar sobre el overlay.
  - Cuando el sidebar está abierto en mobile, debe mostrarse un **overlay** sobre el contenido para indicar modo menú y permitir cerrar al hacer click fuera.
- En mobile no se utiliza el estado “colapsado con iconos” como vista persistente: el modo es **cerrado (off-canvas)** o **abierto (panel visible)**.

#### Persistencia del estado (usuario)
- El estado del sidebar debe persistirse en `localStorage` para desktop/tablet:
  - clave: `admin_sidebar_collapsed`
  - valores: `"0"` abierto, `"1"` colapsado
- En mobile el estado no se persiste (por UX): al recargar, el sidebar debe iniciar cerrado (off-canvas).

#### Requisitos técnicos mínimos (CSS/UX)
- La transición debe aplicarse al cambio de ancho/posición del sidebar (no cambios instantáneos).
- Debe evitarse el “scroll del body” inducido por overscroll cuando el usuario llega al final del menú (overscroll contained).
- El comportamiento no debe romper:
  - lógica de permisos (estáticos y dinámicos)
  - render de módulos dinámicos
  - collapses Bootstrap existentes para submenús en modo abierto
- La implementación debe poder convivir con el scroll interno del sidebar ya especificado (área de navegación con overflow-y auto).
- El header #page-topbar debe crecer hacia la izquierda hasta alcanzar el border derecho del sidebar cuando se muestra la versión minimizada del sidebar. Ahora mismo queda un espacio grande entre el borde derecho de .sidebar y el borde izquierdo de #page-topbar. Concretamente queda el espacio que .sidebar se ha reducido para mostrarse en su versión minimizada. Adjunto imagen con la situación.

